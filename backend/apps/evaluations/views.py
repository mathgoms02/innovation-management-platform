from rest_framework import viewsets, status, views, permissions
from rest_framework.response import Response
from .models import Criterion, Evaluation
from .serializers import (
    CriterionSerializer, EvaluationSerializer, 
    EvaluationCreateSerializer
)
from .services import EvaluationService
from .permissions import IsJudge, IsAdminOrJudge
from apps.hackathons.permissions import IsAdminOrOrganizerOrReadOnly
from apps.hackathons.models import Hackathon
from apps.submissions.models import Submission
from apps.monitoring.mixins import AuditMixin
from apps.monitoring.services import log_action, send_global_notification
from ipware import get_client_ip

class CriterionViewSet(AuditMixin, viewsets.ModelViewSet):
    queryset = Criterion.objects.all()
    serializer_class = CriterionSerializer
    permission_classes = [IsAdminOrOrganizerOrReadOnly]

    def get_queryset(self):
        hackathon_id = self.request.query_params.get('hackathon_id')
        if hackathon_id:
            return self.queryset.filter(hackathon_id=hackathon_id)
        return self.queryset

class EvaluationViewSet(AuditMixin, viewsets.ModelViewSet):
    queryset = Evaluation.objects.select_related('judge', 'submission__team').prefetch_related('scores__criterion')
    serializer_class = EvaluationSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [IsJudge()]
        return [IsAdminOrJudge()]

    def create(self, request, *args, **kwargs):
        serializer = EvaluationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            submission = Submission.objects.get(id=serializer.validated_data['submission_id'])
            
            # Verificação de segurança: O jurado está designado para este hackathon?
            if not submission.team.hackathon.judges.filter(id=request.user.id).exists():
                return Response(
                    {"detail": "Você não está designado como jurado para este hackathon."}, 
                    status=status.HTTP_403_FORBIDDEN
                )

            evaluation = EvaluationService.create_evaluation(
                judge=request.user,
                submission=submission,
                scores_data=serializer.validated_data['scores'],
                comments=serializer.validated_data.get('comments')
            )
            
            # Manual Audit for custom Create
            ip, _ = get_client_ip(request)
            log_action(
                user=request.user,
                action='CREATE',
                resource=evaluation,
                ip_address=ip
            )
            
            # Notificação em tempo real
            send_global_notification(f"Nova avaliação submetida para o time {evaluation.submission.team.name}!")
            
            return Response(
                EvaluationSerializer(evaluation).data, 
                status=status.HTTP_201_CREATED
            )
        except Submission.DoesNotExist:
            return Response(
                {"detail": "Submissão não encontrada."}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return self.queryset.none()
        if user.role == 'JUDGE':
            return self.queryset.filter(judge=user)
        return self.queryset

class RankingView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, hackathon_id):
        try:
            hackathon = Hackathon.objects.get(id=hackathon_id)
            ranking = EvaluationService.get_ranking(hackathon)
            return Response(ranking)
        except Hackathon.DoesNotExist:
            return Response(
                {"detail": "Hackathon não encontrado."}, 
                status=status.HTTP_404_NOT_FOUND
            )
