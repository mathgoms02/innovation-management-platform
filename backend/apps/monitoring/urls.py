from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HealthCheckView, AuditLogViewSet, AnnouncementViewSet, UserStatsView

router = DefaultRouter()
router.register(r'logs', AuditLogViewSet, basename='auditlog')
router.register(r'announcements', AnnouncementViewSet, basename='announcement')

urlpatterns = [
    path('health/', HealthCheckView.as_view(), name='health-check'),
    path('stats/', UserStatsView.as_view(), name='user-stats'),
    path('', include(router.urls)),
]
