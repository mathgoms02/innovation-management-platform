from rest_framework.views import APIView
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db import connections
from django.db.utils import OperationalError
from .models import AuditLog, Announcement
from .serializers import AuditLogSerializer, AnnouncementSerializer
from .services import get_user_stats, get_performance_chart_data

class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        health_status = {
            "status": "healthy",
            "services": {
                "database": "up",
            }
        }
        
        # Check database
        db_conn = connections['default']
        try:
            db_conn.cursor()
        except OperationalError:
            health_status["status"] = "unhealthy"
            health_status["services"]["database"] = "down"
            return Response(health_status, status=503)

        return Response(health_status)

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.select_related('user').all()
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAdminUser]

from apps.hackathons.permissions import IsAdminOrOrganizerOrReadOnly

class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.filter(is_active=True)
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAdminOrOrganizerOrReadOnly]

    def perform_create(self, serializer):
        from .services import send_global_notification
        announcement = serializer.save(created_by=self.request.user)
        send_global_notification(f"📢 {announcement.title}")

class UserStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        stats = get_user_stats(request.user)
        chart_data = get_performance_chart_data(request.user)
        return Response({
            "stats": stats,
            "chart_data": chart_data
        })
