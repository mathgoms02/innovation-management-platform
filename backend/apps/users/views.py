from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, RegisterSerializer, CustomTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from apps.monitoring.services import log_action
from ipware import get_client_ip

User = get_user_model()

class AuditLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            username = request.data.get('username')
            try:
                user = User.objects.get(username=username)
                ip, _ = get_client_ip(request)
                log_action(user, 'LOGIN', user, ip_address=ip)
            except User.DoesNotExist:
                pass
        return response

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Automatic Login: Generate tokens
        refresh = RefreshToken.for_user(user)
        
        # Auditoria
        ip, _ = get_client_ip(request)
        log_action(user, 'CREATE', user, ip_address=ip)
        log_action(user, 'LOGIN', user, ip_address=ip)

        headers = self.get_success_headers(serializer.data)
        return Response({
            "user": UserSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }, status=status.HTTP_201_CREATED, headers=headers)

class IsAdminOrOrganizer(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in ['ADMIN', 'ORGANIZER']
        )


class UserListView(generics.ListAPIView):
    """Lista usuários (opcionalmente filtrados por papel) para Admin/Organizador.

    Usado pelo cockpit do organizador para designar jurados.
    """
    permission_classes = (IsAdminOrOrganizer,)
    serializer_class = UserSerializer

    def get_queryset(self):
        queryset = User.objects.filter(is_active=True).order_by('username')
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role.upper())
        return queryset


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def delete(self, request, *args, **kwargs):
        user = self.get_object()
        # LGPD Anonymization
        user.username = f"deleted_{user.id}"
        user.email = f"deleted_{user.id}@anonymized.local"
        user.first_name = "Anônimo"
        user.last_name = ""
        user.bio = ""
        user.is_active = False
        user.has_accepted_terms = False
        user.set_unusable_password()
        if user.avatar:
            user.avatar.delete(save=False)
        user.save()
        return Response(status=204)
