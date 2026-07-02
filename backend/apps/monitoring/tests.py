from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from channels.testing import WebsocketCommunicator
from core.asgi import application
import unittest

class MonitoringTests(APITestCase):
    def test_health_check(self):
        url = reverse('health-check')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'healthy')
        self.assertEqual(response.data['services']['database'], 'up')

class WebSocketTests(unittest.IsolatedAsyncioTestCase):
    async def test_anonymous_connection_is_rejected(self):
        """Sem token JWT, a conexão WebSocket deve ser recusada."""
        communicator = WebsocketCommunicator(application, "/ws/notifications/")
        connected, _ = await communicator.connect()
        self.assertFalse(connected)
        await communicator.disconnect()

    async def test_authenticated_connection_succeeds(self):
        """Com um access token válido na query string, a conexão é aceita."""
        from channels.db import database_sync_to_async
        from django.contrib.auth import get_user_model
        from rest_framework_simplejwt.tokens import AccessToken

        User = get_user_model()
        user = await database_sync_to_async(User.objects.create_user)(
            username='ws_user', password='password123'
        )
        # AccessToken.for_user does not touch the DB (unlike RefreshToken.for_user,
        # which writes an OutstandingToken and would fail in this async test).
        token = str(AccessToken.for_user(user))

        communicator = WebsocketCommunicator(
            application, f"/ws/notifications/?token={token}"
        )
        connected, _ = await communicator.connect()
        self.assertTrue(connected)
        await communicator.disconnect()

class DashboardDataTests(APITestCase):
    def setUp(self):
        from django.contrib.auth import get_user_model
        self.User = get_user_model()
        self.user = self.User.objects.create_user(username='testuser', password='password123')
        self.client.force_authenticate(user=self.user)

    def test_stats_api(self):
        url = reverse('user-stats')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('stats', response.data)
        self.assertIn('chart_data', response.data)
        self.assertEqual(response.data['stats']['user_teams'], 0)

    def test_announcements_api(self):
        from .models import Announcement
        Announcement.objects.create(title="Test News", content="Content", type='INFO')
        url = reverse('announcement-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], "Test News")
