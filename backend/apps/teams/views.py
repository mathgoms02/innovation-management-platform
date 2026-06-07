from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Team, TeamMember
from .serializers import TeamSerializer

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        hackathon_id = self.request.query_params.get('hackathon_id')
        if hackathon_id:
            return self.queryset.filter(hackathon_id=hackathon_id)
        return self.queryset

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        team = self.get_object()
        user = request.user

        # Check if user is already in a team for this hackathon
        if Team.objects.filter(hackathon=team.hackathon, members=user).exists():
            return Response(
                {"detail": "Você já faz parte de uma equipe neste hackathon."},
                status=status.HTTP_400_BAD_REQUEST
            )

        TeamMember.objects.create(team=team, user=user)
        return Response({"detail": "Você entrou na equipe com sucesso."}, status=status.HTTP_201_CREATED)
