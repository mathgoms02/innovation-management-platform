"""Business logic for the users app.

Encapsulates registration, avatar handling and LGPD anonymization so the views
stay thin (validation + routing only), per the Service Layer pattern.
"""
from django.contrib.auth import get_user_model
from ipware import get_client_ip
from rest_framework_simplejwt.tokens import RefreshToken

from apps.monitoring.services import log_action

User = get_user_model()

ALLOWED_AVATAR_TYPES = {'image/jpeg', 'image/png', 'image/gif', 'image/webp'}
MAX_AVATAR_SIZE = 5 * 1024 * 1024  # 5 MB


class AvatarValidationError(Exception):
    """Raised when an uploaded avatar fails type/size validation."""


class UserService:
    @staticmethod
    def register(serializer, request):
        """Create a user, issue JWT tokens and audit creation + login."""
        user = serializer.save()
        refresh = RefreshToken.for_user(user)

        ip, _ = get_client_ip(request)
        log_action(user, 'CREATE', user, ip_address=ip)
        log_action(user, 'LOGIN', user, ip_address=ip)

        return user, refresh

    @staticmethod
    def audit_login(username, request):
        """Record a successful login in the audit trail."""
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return
        ip, _ = get_client_ip(request)
        log_action(user, 'LOGIN', user, ip_address=ip)

    @staticmethod
    def set_avatar(user, avatar, request):
        """Validate and store a new avatar, replacing any existing file."""
        if not avatar:
            raise AvatarValidationError('Nenhum arquivo enviado.')
        if avatar.content_type not in ALLOWED_AVATAR_TYPES:
            raise AvatarValidationError('Formato não suportado. Use JPEG, PNG, GIF ou WebP.')
        if avatar.size > MAX_AVATAR_SIZE:
            raise AvatarValidationError('Arquivo excede o limite de 5 MB.')

        if user.avatar:
            user.avatar.delete(save=False)
        user.avatar = avatar
        user.save(update_fields=['avatar'])

        ip, _ = get_client_ip(request)
        log_action(user, 'UPDATE', user, ip_address=ip)
        return user

    @staticmethod
    def clear_avatar(user, request):
        """Remove the user's avatar if present."""
        if user.avatar:
            user.avatar.delete(save=False)
            user.avatar = None
            user.save(update_fields=['avatar'])

            ip, _ = get_client_ip(request)
            log_action(user, 'UPDATE', user, ip_address=ip)
        return user

    @staticmethod
    def anonymize(user):
        """LGPD-compliant deletion: overwrite PII instead of removing the row."""
        user.username = f"deleted_{user.id}"
        user.email = f"deleted_{user.id}@anonymized.local"
        user.first_name = "Anônimo"
        user.last_name = ""
        user.bio = ""
        user.is_active = False
        user.has_accepted_terms = False
        user.set_unusable_password()
        if user.avatar:
            user.avatar.delete(save=False)
        user.save()
        return user
