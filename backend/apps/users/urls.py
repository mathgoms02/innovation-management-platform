from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    RegisterView, UserDetailView, AuditLoginView, UserListView, AvatarUploadView,
    PasswordResetRequestView, PasswordResetConfirmView, PasswordChangeView,
    EmailVerifyView, EmailVerifyResendView, LogoutAllView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', AuditLoginView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', UserDetailView.as_view(), name='user_detail'),
    path('me/avatar/', AvatarUploadView.as_view(), name='user_avatar'),
    path('password/reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('password/change/', PasswordChangeView.as_view(), name='password_change'),
    path('verify-email/', EmailVerifyView.as_view(), name='verify_email'),
    path('verify-email/resend/', EmailVerifyResendView.as_view(), name='verify_email_resend'),
    path('logout-all/', LogoutAllView.as_view(), name='logout_all'),
    path('', UserListView.as_view(), name='user_list'),
]
