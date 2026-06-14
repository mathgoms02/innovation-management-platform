from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from apps.hackathons.models import Hackathon
from apps.evaluations.models import Evaluation
from .services import log_action
import json

User = get_user_model()

@receiver(post_save, sender=Hackathon)
def audit_hackathon_save(sender, instance, created, **kwargs):
    action = 'CREATE' if created else 'UPDATE'
    # Note: We don't have the request/user here easily via signals 
    # unless we use a library or middleware to store the current user.
    # For now, we'll log it without a user or find a way to get it.
    pass

# Actually, logging in views/services is better if we want to capture the user easily
# without adding complex middleware for thread-local storage of the user.
