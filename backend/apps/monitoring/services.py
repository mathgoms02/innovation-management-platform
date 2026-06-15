from .models import AuditLog, Announcement
from django.contrib.contenttypes.models import ContentType
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.db.models import Count, Avg
from apps.hackathons.models import Hackathon
from apps.teams.models import Team
from apps.evaluations.models import Evaluation, Score

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

def get_user_stats(user):
    """
    Calculates real metrics for the user's dashboard.
    """
    # Active Hackathons
    active_hackathons = Hackathon.objects.filter(
        status__in=[Hackathon.Status.PUBLISHED, Hackathon.Status.ONGOING]
    ).count()

    # User Teams
    user_teams = Team.objects.filter(members=user).count()

    # XP Calculation (Dummy but consistent)
    # XP = (Teams * 50) + (Submissions * 200) + (Avg Score * 20)
    stats = Team.objects.filter(members=user).aggregate(
        total_teams=Count('id', distinct=True),
        total_submissions=Count('submission', distinct=True),
    )
    
    # Average score across all user team submissions
    avg_score = Score.objects.filter(
        evaluation__submission__team__members=user
    ).aggregate(avg=Avg('value'))['avg'] or 0.0

    xp_total = (stats['total_teams'] * 50) + (stats['total_submissions'] * 200) + int(avg_score * 20)

    return {
        "active_hackathons": active_hackathons,
        "user_teams": user_teams,
        "xp_total": xp_total,
        "avg_score": round(avg_score, 1)
    }

def get_performance_chart_data(user):
    """
    Generates data for the Recharts bar chart.
    Shows average score per team/hackathon.
    """
    teams = Team.objects.filter(members=user).prefetch_related('submission')
    chart_data = []
    
    for team in teams:
        avg = Score.objects.filter(
            evaluation__submission__team=team
        ).aggregate(avg=Avg('value'))['avg'] or 0.0
        
        chart_data.append({
            "name": team.name[:8], 
            "value": round(avg * 10, 0), 
            "color": "var(--color-primary)" if avg > 7 else "var(--color-secondary)"
        })
        
    # Fill with empty data if needed
    while len(chart_data) < 4:
        chart_data.append({"name": "-", "value": 0, "color": "rgba(255,255,255,0.05)"})
        
    return chart_data[:6]
