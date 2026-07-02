from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .serializers import (
    UserSerializer, RegisterSerializer, CustomTokenObtainPairSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    PasswordChangeSerializer, EmailVerifySerializer,
)
from .services import UserService, AvatarValidationError
from rest_framework_simplejwt.views import TokenObtainPairView

User = get_user_model()

class AuditLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    throttle_scope = 'login'

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            UserService.audit_login(request.data.get('username'), request)
        return response

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer
    throttle_scope = 'register'

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user, refresh = UserService.register(serializer, request)

        headers = self.get_success_headers(serializer.data)
        return Response({
            "user": UserSerializer(user, context={'request': request}).data,
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
        UserService.anonymize(self.get_object())
        return Response(status=204)


class AvatarUploadView(APIView):
    """Upload ou remoção do avatar do usuário autenticado."""
    permission_classes = (permissions.IsAuthenticated,)
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        try:
            user = UserService.set_avatar(request.user, request.FILES.get('avatar'), request)
        except AvatarValidationError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        serializer = UserSerializer(user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request):
        user = UserService.clear_avatar(request.user, request)
        serializer = UserSerializer(user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class PasswordResetRequestView(APIView):
    """Request a password-reset e-mail. Always 200 (never reveals existence)."""
    permission_classes = (permissions.AllowAny,)
    throttle_scope = 'register'

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        UserService.request_password_reset(serializer.validated_data['email'])
        return Response(
            {'detail': 'Se o e-mail existir, um link de redefinição foi enviado.'},
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ok = UserService.confirm_password_reset(
            serializer.validated_data['uid'],
            serializer.validated_data['token'],
            serializer.validated_data['new_password'],
        )
        if not ok:
            return Response(
                {'detail': 'Link inválido ou expirado.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response({'detail': 'Senha redefinida com sucesso.'}, status=status.HTTP_200_OK)


class PasswordChangeView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ok = UserService.change_password(
            request.user,
            serializer.validated_data['old_password'],
            serializer.validated_data['new_password'],
        )
        if not ok:
            return Response(
                {'detail': 'Senha atual incorreta.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response({'detail': 'Senha alterada com sucesso.'}, status=status.HTTP_200_OK)


class EmailVerifyView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = EmailVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = UserService.verify_email(
            serializer.validated_data['uid'],
            serializer.validated_data['token'],
        )
        if not user:
            return Response(
                {'detail': 'Link de verificação inválido ou expirado.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response({'detail': 'E-mail verificado com sucesso.'}, status=status.HTTP_200_OK)
