import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# get_asgi_application() must run before importing anything that touches models.
django_asgi_app = get_asgi_application()

from apps.monitoring.middleware import JWTAuthMiddleware
import apps.monitoring.routing

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JWTAuthMiddleware(
        URLRouter(
            apps.monitoring.routing.websocket_urlpatterns
        )
    ),
})
