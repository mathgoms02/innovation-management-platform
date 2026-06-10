from django.utils import timezone
from rest_framework.exceptions import ValidationError
from django.db import transaction
from .models import Submission

class SubmissionService:
    @staticmethod
    @transaction.atomic
    def create_or_update_submission(team, user, data):
        # 1. Validate if user is member of the team
        if not team.members.filter(id=user.id).exists():
            raise ValidationError("Você não é membro desta equipe.")
        
        hackathon = team.hackathon
        
        # 2. Validate hackathon status
        if hackathon.status != 'ONGOING':
            raise ValidationError("Submissões só são permitidas para hackathons em andamento.")
            
        # 3. Validate deadline
        if timezone.now() > hackathon.end_date:
            raise ValidationError("O prazo de submissão para este hackathon já encerrou.")
            
        # 4. Create or update submission
        submission, created = Submission.objects.update_or_create(
            team=team,
            defaults={
                'description': data.get('description'),
                'repository_url': data.get('repository_url'),
                'presentation_url': data.get('presentation_url'),
            }
        )
        return submission
