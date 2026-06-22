from django.db import models
from django.conf import settings

class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
        ('LOGIN', 'Login'),
        ('LOGOUT', 'Logout'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs'
    )
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    resource_type = models.CharField(max_length=100)
    resource_id = models.CharField(max_length=255, null=True, blank=True)
    changes = models.JSONField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user} - {self.action} - {self.resource_type} ({self.timestamp})"

class Announcement(models.Model):
    class Type(models.TextChoices):
        INFO = 'INFO', 'Informação'
        WARNING = 'WARNING', 'Alerta'
        SUCCESS = 'SUCCESS', 'Sucesso'
        URGENT = 'URGENT', 'Urgente'

    title = models.CharField(max_length=200)
    content = models.TextField()
    type = models.CharField(max_length=20, choices=Type.choices, default=Type.INFO)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='announcements'
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
