from rest_framework import viewsets
from .models import Hackathon
from .serializers import HackathonSerializer
from .permissions import IsAdminOrOrganizerOrReadOnly
from apps.monitoring.mixins import AuditMixin

class HackathonViewSet(AuditMixin, viewsets.ModelViewSet):
    queryset = Hackathon.objects.prefetch_related('judges', 'organizer')
    serializer_class = HackathonSerializer
    permission_classes = [IsAdminOrOrganizerOrReadOnly]

    def perform_create(self, serializer):
        user = self.request.user
        # Se for ORGANIZER (ou ADMIN), salva o organizer
        if user.role in ['ADMIN', 'ORGANIZER']:
            instance = serializer.save(organizer=user)
        else:
            instance = serializer.save()
        
        # Chama a auditoria manual já que reescrevemos o perform_create do mixin
        from ipware import get_client_ip
        from apps.monitoring.services import log_action
        ip, _ = get_client_ip(self.request)
        log_action(user, 'CREATE', instance, ip_address=ip)

    def perform_update(self, serializer):
        instance = serializer.save()
        from ipware import get_client_ip
        from apps.monitoring.services import log_action
        ip, _ = get_client_ip(self.request)
        log_action(self.request.user, 'UPDATE', instance, ip_address=ip)
