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
