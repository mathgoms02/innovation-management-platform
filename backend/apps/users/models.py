from django.contrib.auth.models import AbstractUser
from django.db import models


def default_preferences():
    """UI preferences applied on the frontend. Keys are whitelisted server-side."""
    return {
        'accent': 'cyan',        # cyan | magenta | lime | violet
        'reduce_motion': False,
        'notifications': True,
        'plain_text': False,     # strip the cyberpunk underscore styling
        'language': 'pt-BR',     # pt-BR | en
    }


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Administrador'
        ORGANIZER = 'ORGANIZER', 'Organizador'
        PARTICIPANT = 'PARTICIPANT', 'Participante'
        JUDGE = 'JUDGE', 'Jurado'

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.PARTICIPANT
    )
    bio = models.TextField(blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    has_accepted_terms = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    preferences = models.JSONField(default=default_preferences, blank=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
