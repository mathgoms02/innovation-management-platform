"""Business logic for the hackathons app.

Keeps ViewSets thin: organizer assignment and audit logging live here, per the
Service Layer pattern enforced across the project.
"""
from ipware import get_client_ip

from apps.monitoring.services import log_action


class HackathonService:
    @staticmethod
    def create(serializer, user, request):
        """Persist a new hackathon, assigning the organizer and auditing it."""
        if user.role in ['ADMIN', 'ORGANIZER']:
            instance = serializer.save(organizer=user)
        else:
            instance = serializer.save()

        ip, _ = get_client_ip(request)
        log_action(user, 'CREATE', instance, ip_address=ip)
        return instance

    @staticmethod
    def update(serializer, user, request):
        """Persist changes to a hackathon and audit them."""
        instance = serializer.save()
        ip, _ = get_client_ip(request)
        log_action(user, 'UPDATE', instance, ip_address=ip)
        return instance
