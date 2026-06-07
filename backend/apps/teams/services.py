from django.db import transaction
from rest_framework.exceptions import ValidationError
from django.utils import timezone
from .models import Team, TeamMember

class TeamService:
    @staticmethod
    @transaction.atomic
    def create_team(hackathon, name, leader):
        if hackathon.status not in ['PUBLISHED', 'ONGOING']:
            raise ValidationError("Este hackathon não está aberto para inscrições.")
        
        if hackathon.registration_deadline < timezone.now():
            raise ValidationError("O prazo de inscrições para este hackathon já encerrou.")
            
        if Team.objects.filter(hackathon=hackathon, members=leader).exists():
            raise ValidationError("Você já faz parte de uma equipe neste hackathon.")
            
        team = Team.objects.create(name=name, hackathon=hackathon, leader=leader)
        TeamMember.objects.create(team=team, user=leader)
        return team

    @staticmethod
    @transaction.atomic
    def join_team(team, user):
        if team.hackathon.status not in ['PUBLISHED', 'ONGOING']:
            raise ValidationError("Este hackathon não está aberto para inscrições.")
            
        if team.hackathon.registration_deadline < timezone.now():
            raise ValidationError("O prazo de inscrições para este hackathon já encerrou.")
            
        if Team.objects.filter(hackathon=team.hackathon, members=user).exists():
            raise ValidationError("Você já faz parte de uma equipe neste hackathon.")
            
        return TeamMember.objects.create(team=team, user=user)
