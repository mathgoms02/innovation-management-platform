from .models import AuditLog
from django.contrib.contenttypes.models import ContentType

def log_action(user, action, resource, changes=None, ip_address=None):
    """
    Utility function to log an action in the AuditLog.
    """
    resource_type = resource.__class__.__name__
    resource_id = str(resource.pk) if hasattr(resource, 'pk') else None
    
    AuditLog.objects.create(
        user=user,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        changes=changes,
        ip_address=ip_address
    )
