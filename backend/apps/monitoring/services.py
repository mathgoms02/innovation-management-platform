from .models import AuditLog
from django.contrib.contenttypes.models import ContentType
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

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

def send_global_notification(message):
    """
    Sends a notification to all connected users via WebSocket.
    Resilient to channel layer errors (e.g. Redis down).
    """
    try:
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                "notifications",
                {
                    "type": "send_notification",
                    "message": message
                }
            )
    except Exception as e:
        # Log error but don't crash the request
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to send global notification: {e}")
