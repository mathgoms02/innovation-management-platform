from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CriterionViewSet, EvaluationViewSet, RankingView

router = DefaultRouter()
router.register(r'criteria', CriterionViewSet)
router.register(r'evaluations', EvaluationViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('ranking/<int:hackathon_id>/', RankingView.as_view(), name='ranking'),
]
