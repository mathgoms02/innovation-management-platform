from rest_framework import generics, permissions
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, RegisterSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

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
