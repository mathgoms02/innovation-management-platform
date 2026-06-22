from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
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
        # Valida formato/obrigatoriedade dos campos via serializer.
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        team = serializer.validated_data['team']

        try:
            submission = SubmissionService.create_or_update_submission(
                team=team,
                user=request.user,
                data=serializer.validated_data
            )
        except ValidationError as e:
            return Response({"detail": e.detail}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            self.get_serializer(submission).data,
            status=status.HTTP_201_CREATED
        )
