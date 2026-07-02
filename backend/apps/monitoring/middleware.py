from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import AccessToken

User = get_user_model()


@database_sync_to_async
def _get_user(user_id):
    try:
        return User.objects.get(id=user_id, is_active=True)
    except User.DoesNotExist:
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    """Autentica conexões WebSocket via JWT.

    Lê o token do access na query string (`?token=`), valida com SimpleJWT e
    popula `scope["user"]`. Tokens inválidos/ausentes resultam em `AnonymousUser`
    (a rejeição efetiva da conexão é feita pelo consumer).
    """

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode()
        token = parse_qs(query_string).get("token", [None])[0]

        scope["user"] = AnonymousUser()
        if token:
            try:
                access = AccessToken(token)
                scope["user"] = await _get_user(access["user_id"])
            except (TokenError, KeyError):
                scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)
