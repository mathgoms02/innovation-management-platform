from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import RegisterView, UserDetailView, AuditLoginView, UserListView, AvatarUploadView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', AuditLoginView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', UserDetailView.as_view(), name='user_detail'),
    path('me/avatar/', AvatarUploadView.as_view(), name='user_avatar'),
    path('', UserListView.as_view(), name='user_list'),
]
