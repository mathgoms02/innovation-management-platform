from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Submission
from .serializers import SubmissionSerializer
from .services import SubmissionService
from apps.teams.models import Team

class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can see submissions from their own teams
        return self.queryset.filter(team__members=self.request.user).distinct()

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
