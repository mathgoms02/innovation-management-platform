from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from apps.hackathons.models import Hackathon
from apps.evaluations.models import Evaluation
from .services import log_action
import json

User = get_user_model()

from django.contrib.auth.signals import user_logged_in, user_logged_out
from .services import log_action

@receiver(user_logged_in)
def audit_login(sender, request, user, **kwargs):
    log_action(user, 'LOGIN', user, ip_address=request.META.get('REMOTE_ADDR'))

@receiver(user_logged_out)
def audit_logout(sender, request, user, **kwargs):
    if user:
        log_action(user, 'LOGOUT', user, ip_address=request.META.get('REMOTE_ADDR'))
