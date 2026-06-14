from rest_framework import viewsets
from .models import Hackathon
from .serializers import HackathonSerializer
from .permissions import IsAdminOrReadOnly
from apps.monitoring.mixins import AuditMixin

class HackathonViewSet(AuditMixin, viewsets.ModelViewSet):
    queryset = Hackathon.objects.prefetch_related('judges')
    serializer_class = HackathonSerializer
    permission_classes = [IsAdminOrReadOnly]
