from .services import log_action
from ipware import get_client_ip

class AuditMixin:
    """
    Mixin to automatically log CRUD actions in a ViewSet.
    """
    def perform_create(self, serializer):
        instance = serializer.save()
        ip, _ = get_client_ip(self.request)
        log_action(
            user=self.request.user,
            action='CREATE',
            resource=instance,
            ip_address=ip
        )

    def perform_update(self, serializer):
        instance = serializer.save()
        ip, _ = get_client_ip(self.request)
        log_action(
            user=self.request.user,
            action='UPDATE',
            resource=instance,
            ip_address=ip
        )

    def perform_destroy(self, instance):
        ip, _ = get_client_ip(self.request)
        log_action(
            user=self.request.user,
            action='DELETE',
            resource=instance,
            ip_address=ip
        )
        instance.delete()
