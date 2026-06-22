from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, PermissionDenied
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import Team, TeamJoinRequest
from .serializers import TeamSerializer, TeamJoinRequestSerializer
from .services import TeamService
from .permissions import IsTeamLeaderOrReadOnly

User = get_user_model()


class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.select_related('leader', 'hackathon').prefetch_related('members')
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        # Edição/exclusão da própria equipe restritas ao líder; demais
        # ações (join, request-join, leitura) apenas exigem autenticação.
        if self.action in ('update', 'partial_update', 'destroy'):
            return [permissions.IsAuthenticated(), IsTeamLeaderOrReadOnly()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = self.queryset

        hackathon_id = self.request.query_params.get('hackathon_id')
        if hackathon_id:
            queryset = queryset.filter(hackathon_id=hackathon_id)

        if self.request.query_params.get('mine') == 'true':
            queryset = queryset.filter(members=self.request.user)

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)

        return queryset.distinct()

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        """Entrada direta (mantida para compatibilidade)."""
        team = self.get_object()
        try:
            TeamService.join_team(team, request.user)
            return Response({"detail": "Você entrou na equipe com sucesso."}, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response({"detail": e.detail}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='request-join')
    def request_join(self, request, pk=None):
        team = self.get_object()
        try:
            join_request = TeamService.request_to_join(team, request.user)
        except ValidationError as e:
            return Response({"detail": e.detail}, status=status.HTTP_400_BAD_REQUEST)
        return Response(
            TeamJoinRequestSerializer(join_request).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        team = self.get_object()
        try:
            TeamService.leave_team(team, request.user)
        except ValidationError as e:
            return Response({"detail": e.detail}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "Você saiu da equipe."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='members/(?P<member_id>[^/.]+)/remove')
    def remove_member(self, request, pk=None, member_id=None):
        team = self.get_object()
        if team.leader_id != request.user.id and request.user.role != 'ADMIN':
            raise PermissionDenied("Apenas o líder pode remover membros.")
        member = get_object_or_404(User, pk=member_id)
        try:
            TeamService.remove_member(team, member)
        except ValidationError as e:
            return Response({"detail": e.detail}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "Membro removido."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], url_path='requests')
    def list_requests(self, request, pk=None):
        team = self.get_object()
        if team.leader_id != request.user.id and request.user.role != 'ADMIN':
            raise PermissionDenied("Apenas o líder pode visualizar as solicitações.")
        pending = team.join_requests.filter(
            status=TeamJoinRequest.Status.PENDING
        ).select_related('user')
        return Response(TeamJoinRequestSerializer(pending, many=True).data)

    @action(detail=True, methods=['post'], url_path='requests/(?P<request_id>[^/.]+)/respond')
    def respond_request(self, request, pk=None, request_id=None):
        team = self.get_object()
        if team.leader_id != request.user.id and request.user.role != 'ADMIN':
            raise PermissionDenied("Apenas o líder pode responder solicitações.")

        join_request = get_object_or_404(team.join_requests, pk=request_id)
        approve = bool(request.data.get('approve', False))
        try:
            TeamService.respond_to_request(join_request, approve)
        except ValidationError as e:
            return Response({"detail": e.detail}, status=status.HTTP_400_BAD_REQUEST)
        return Response(TeamJoinRequestSerializer(join_request).data)
