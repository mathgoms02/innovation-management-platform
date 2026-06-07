from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from apps.hackathons.models import Hackathon
from .models import Team, TeamMember
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class TeamTests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='user1', password='password123')
        self.user2 = User.objects.create_user(username='user2', password='password123')
        self.hackathon = Hackathon.objects.create(
            title='Hackathon 1',
            description='Desc',
            start_date=timezone.now() + timedelta(days=1),
            end_date=timezone.now() + timedelta(days=2),
            registration_deadline=timezone.now() + timedelta(hours=12),
            status='PUBLISHED'
        )

    def test_create_team(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse('team-list')
        data = {'name': 'Team Alpha', 'hackathon': self.hackathon.id}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Team.objects.count(), 1)
        self.assertEqual(Team.objects.get().leader, self.user1)
        self.assertEqual(TeamMember.objects.count(), 1)

    def test_join_team(self):
        team = Team.objects.create(name='Team Beta', hackathon=self.hackathon, leader=self.user1)
        TeamMember.objects.create(team=team, user=self.user1)
        
        self.client.force_authenticate(user=self.user2)
        url = reverse('team-join', args=[team.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(team.members.count(), 2)

    def test_prevent_multiple_teams_same_hackathon(self):
        # User1 already in a team
        team1 = Team.objects.create(name='Team 1', hackathon=self.hackathon, leader=self.user1)
        TeamMember.objects.create(team=team1, user=self.user1)
        
        self.client.force_authenticate(user=self.user1)
        url = reverse('team-list')
        data = {'name': 'Team 2', 'hackathon': self.hackathon.id}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
    def test_prevent_creation_after_deadline(self):
        self.hackathon.registration_deadline = timezone.now() - timedelta(hours=1)
        self.hackathon.save()
        
        self.client.force_authenticate(user=self.user1)
        url = reverse('team-list')
        data = {'name': 'Team Late', 'hackathon': self.hackathon.id}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
