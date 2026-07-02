from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

User = get_user_model()


def _run_password_validators(value):
    try:
        validate_password(value)
    except DjangoValidationError as exc:
        raise serializers.ValidationError(list(exc.messages))
    return value


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)

    def validate_new_password(self, value):
        return _run_password_validators(value)


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate_new_password(self, value):
        return _run_password_validators(value)


class EmailVerifySerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user, context=self.context).data
        return data

class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    # Allowed preference keys and their accepted values (None = any bool).
    PREF_ACCENTS = {'cyan', 'magenta', 'lime', 'violet'}
    PREF_LANGUAGES = {'pt-BR', 'en'}

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'bio', 'avatar', 'has_accepted_terms', 'is_email_verified', 'preferences')
        read_only_fields = ('id', 'has_accepted_terms', 'is_email_verified')

    def get_avatar(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None

    def validate_preferences(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError('preferences deve ser um objeto.')

        cleaned = {}
        for key in ('reduce_motion', 'notifications', 'plain_text'):
            if key in value:
                if not isinstance(value[key], bool):
                    raise serializers.ValidationError(f'{key} deve ser booleano.')
                cleaned[key] = value[key]
        if 'accent' in value:
            if value['accent'] not in self.PREF_ACCENTS:
                raise serializers.ValidationError(f"accent deve ser um de {sorted(self.PREF_ACCENTS)}.")
            cleaned['accent'] = value['accent']
        if 'language' in value:
            if value['language'] not in self.PREF_LANGUAGES:
                raise serializers.ValidationError(f"language deve ser um de {sorted(self.PREF_LANGUAGES)}.")
            cleaned['language'] = value['language']
        return cleaned

    def update(self, instance, validated_data):
        # Merge preferences instead of replacing, so partial updates work.
        prefs = validated_data.pop('preferences', None)
        if prefs is not None:
            merged = {**(instance.preferences or {}), **prefs}
            instance.preferences = merged
        return super().update(instance, validated_data)

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
