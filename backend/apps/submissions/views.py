from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Submission
from .serializers import SubmissionSerializer
from .services import SubmissionService
from apps.teams.models import Team

class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.select_related('team__hackathon')
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return self.queryset.none()
            
        if user.role in ['ADMIN', 'JUDGE']:
            hackathon_id = self.request.query_params.get('hackathon_id')
            if hackathon_id:
                return self.queryset.filter(team__hackathon_id=hackathon_id)
            return self.queryset
            
        return self.queryset.filter(team__members=user).distinct()

    def create(self, request, *args, **kwargs):
        team_id = request.data.get('team')
        try:
            team = Team.objects.get(id=team_id)
            submission = SubmissionService.create_or_update_submission(
                team=team,
                user=request.user,
                data=request.data
            )
            serializer = self.get_serializer(submission)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Team.DoesNotExist:
            return Response({"detail": "Equipe não encontrada."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            # Handle list of errors if it's a ValidationError
            detail = getattr(e, 'detail', str(e))
            return Response({"detail": detail}, status=status.HTTP_400_BAD_REQUEST)
