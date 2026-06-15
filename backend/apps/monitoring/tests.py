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
    async def test_notification_websocket(self):
        communicator = WebsocketCommunicator(application, "/ws/notifications/")
        connected, subprotocol = await communicator.connect()
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
