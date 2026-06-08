from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SubmissionViewSet

router = DefaultRouter()
router.register(r'', SubmissionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
