from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, RegisterSerializer

User = get_user_model()

from apps.monitoring.services import log_action
from ipware import get_client_ip
from rest_framework_simplejwt.tokens import RefreshToken

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
        
        # Auditoria de Cadastro (que também é um login inicial)
        ip, _ = get_client_ip(request)
        log_action(user, 'CREATE', user, ip_address=ip)
        log_action(user, 'LOGIN', user, ip_address=ip)

        headers = self.get_success_headers(serializer.data)
        return Response({
            "user": UserSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }, status=status.HTTP_201_CREATED, headers=headers)

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
