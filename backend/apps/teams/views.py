from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from .models import Team
from .serializers import TeamSerializer
from .services import TeamService

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.select_related('leader').prefetch_related('members')
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = self.queryset
        hackathon_id = self.request.query_params.get('hackathon_id')
        if hackathon_id:
            queryset = queryset.filter(hackathon_id=hackathon_id)
        
        if self.request.query_params.get('mine') == 'true':
            queryset = queryset.filter(members=self.request.user)
            
        return queryset.distinct()

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        team = self.get_object()
        user = request.user

        try:
            TeamService.join_team(team, user)
            return Response({"detail": "Você entrou na equipe com sucesso."}, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response({"detail": e.detail}, status=status.HTTP_400_BAD_REQUEST)
