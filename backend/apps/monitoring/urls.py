from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HealthCheckView, AuditLogViewSet

router = DefaultRouter()
router.register(r'logs', AuditLogViewSet, basename='auditlog')

urlpatterns = [
    path('health/', HealthCheckView.as_view(), name='health-check'),
    path('', include(router.urls)),
]
