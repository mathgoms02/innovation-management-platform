from rest_framework.views import APIView
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db import connections
from django.db.utils import OperationalError
from .models import AuditLog
from .serializers import AuditLogSerializer

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
