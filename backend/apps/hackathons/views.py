from rest_framework import viewsets
from .models import Hackathon
from .serializers import HackathonSerializer
from .permissions import IsAdminOrOrganizerOrReadOnly
from .services import HackathonService
from apps.monitoring.mixins import AuditMixin

class HackathonViewSet(AuditMixin, viewsets.ModelViewSet):
    queryset = Hackathon.objects.prefetch_related('judges', 'organizer')
    serializer_class = HackathonSerializer
    permission_classes = [IsAdminOrOrganizerOrReadOnly]

    def perform_create(self, serializer):
        HackathonService.create(serializer, self.request.user, self.request)

    def perform_update(self, serializer):
        HackathonService.update(serializer, self.request.user, self.request)
