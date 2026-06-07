from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from .models import Hackathon
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class HackathonTests(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user(
            username='admin', password='password123', role='ADMIN'
        )
        self.participant = User.objects.create_user(
            username='participant', password='password123', role='PARTICIPANT'
        )
        self.hackathon_data = {
            'title': 'Hackathon Test',
            'description': 'Description',
            'start_date': timezone.now() + timedelta(days=1),
            'end_date': timezone.now() + timedelta(days=2),
            'registration_deadline': timezone.now() + timedelta(hours=12),
            'status': 'DRAFT'
        }

    def test_create_hackathon_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('hackathon-list')
        response = self.client.post(url, self.hackathon_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Hackathon.objects.count(), 1)

    def test_create_hackathon_participant_denied(self):
        self.client.force_authenticate(user=self.participant)
        url = reverse('hackathon-list')
        response = self.client.post(url, self.hackathon_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_hackathons_public(self):
        Hackathon.objects.create(**self.hackathon_data)
        url = reverse('hackathon-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
