from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user, context=self.context).data
        return data

class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'bio', 'avatar', 'has_accepted_terms')
        read_only_fields = ('id', 'has_accepted_terms')

    def get_avatar(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    has_accepted_terms = serializers.BooleanField(required=True)

    class Meta:
        model = User
        # `role` é intencionalmente omitido: auto-cadastro é sempre PARTICIPANT.
        # Papéis privilegiados (JUDGE/ORGANIZER/ADMIN) são atribuídos por
        # Admin/Organizador, nunca escolhidos pelo próprio usuário.
        fields = ('username', 'email', 'password', 'has_accepted_terms')

    def validate_has_accepted_terms(self, value):
        if not value:
            raise serializers.ValidationError("Você deve aceitar os termos de uso.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            role=User.Role.PARTICIPANT,
            has_accepted_terms=validated_data['has_accepted_terms']
        )
        return user
