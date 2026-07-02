"""Business logic for the users app.

Encapsulates registration, avatar handling and LGPD anonymization so the views
stay thin (validation + routing only), per the Service Layer pattern.
"""
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from ipware import get_client_ip
from rest_framework_simplejwt.tokens import RefreshToken

from apps.monitoring.services import log_action
from .tokens import email_verification_token

User = get_user_model()

ALLOWED_AVATAR_TYPES = {'image/jpeg', 'image/png', 'image/gif', 'image/webp'}
MAX_AVATAR_SIZE = 5 * 1024 * 1024  # 5 MB


class AvatarValidationError(Exception):
    """Raised when an uploaded avatar fails type/size validation."""


class UserService:
    @staticmethod
    def register(serializer, request):
        """Create a user, issue JWT tokens, audit and send a verification email."""
        user = serializer.save()
        refresh = RefreshToken.for_user(user)

        ip, _ = get_client_ip(request)
        log_action(user, 'CREATE', user, ip_address=ip)
        log_action(user, 'LOGIN', user, ip_address=ip)

        if user.email:
            UserService.send_verification_email(user)

        return user, refresh

    @staticmethod
    def _uid(user):
        return urlsafe_base64_encode(force_bytes(user.pk))

    @staticmethod
    def _user_from_uid(uidb64):
        try:
            pk = force_str(urlsafe_base64_decode(uidb64))
            return User.objects.get(pk=pk)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return None

    @staticmethod
    def send_verification_email(user):
        """E-mail the user a link to confirm their address."""
        uid = UserService._uid(user)
        token = email_verification_token.make_token(user)
        link = f"{settings.FRONTEND_URL}/verify-email?uid={uid}&token={token}"
        send_mail(
            subject="Confirme seu e-mail",
            message=f"Bem-vindo! Confirme seu e-mail acessando: {link}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )

    @staticmethod
    def verify_email(uidb64, token):
        """Confirm an e-mail from a verification link. Returns the user or None."""
        user = UserService._user_from_uid(uidb64)
        if user and email_verification_token.check_token(user, token):
            if not user.is_email_verified:
                user.is_email_verified = True
                user.save(update_fields=['is_email_verified'])
            return user
        return None

    @staticmethod
    def request_password_reset(email):
        """E-mail a password-reset link if an active account matches.

        Always returns None (callers must not reveal whether the e-mail exists).
        """
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if not user:
            return
        uid = UserService._uid(user)
        token = default_token_generator.make_token(user)
        link = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"
        send_mail(
            subject="Redefinição de senha",
            message=f"Para redefinir sua senha, acesse: {link}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )

    @staticmethod
    def confirm_password_reset(uidb64, token, new_password):
        """Set a new password from a reset link. Returns True on success."""
        user = UserService._user_from_uid(uidb64)
        if user and default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save(update_fields=['password'])
            return True
        return False

    @staticmethod
    def change_password(user, old_password, new_password):
        """Change the password of an authenticated user (verifies the old one)."""
        if not user.check_password(old_password):
            return False
        user.set_password(new_password)
        user.save(update_fields=['password'])
        return True

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
