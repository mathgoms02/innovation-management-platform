from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from apps.hackathons.models import Hackathon
from apps.teams.models import Team, TeamMember
from .models import Submission
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class SubmissionTests(APITestCase):
    def setUp(self):
        self.user_member = User.objects.create_user(username='member', password='password123')
        self.user_non_member = User.objects.create_user(username='nonmember', password='password123')
        
        self.hackathon = Hackathon.objects.create(
            title='Hackathon 1',
            description='Desc',
            start_date=timezone.now() - timedelta(days=1),
            end_date=timezone.now() + timedelta(days=1),
            registration_deadline=timezone.now() - timedelta(hours=1),
            status='ONGOING'
        )
        
        self.team = Team.objects.create(
            name='Team Member', 
            hackathon=self.hackathon, 
            leader=self.user_member
        )
        TeamMember.objects.create(team=self.team, user=self.user_member)

    def test_create_submission_success(self):
        self.client.force_authenticate(user=self.user_member)
        url = reverse('submission-list')
        data = {
            'team': self.team.id,
            'description': 'Our amazing project',
            'repository_url': 'https://github.com/test/repo',
            'presentation_url': 'https://slides.com/test'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Submission.objects.count(), 1)
        self.assertEqual(Submission.objects.get().team, self.team)

    def test_update_submission_success(self):
        # Create initial submission
        Submission.objects.create(
            team=self.team,
            description='Old desc',
            repository_url='https://old.url'
        )
        
        self.client.force_authenticate(user=self.user_member)
        url = reverse('submission-list')
        data = {
            'team': self.team.id,
            'description': 'Updated desc',
            'repository_url': 'https://new.url'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Submission.objects.count(), 1)
        self.assertEqual(Submission.objects.get().description, 'Updated desc')

    def test_submission_non_member_fails(self):
        self.client.force_authenticate(user=self.user_non_member)
        url = reverse('submission-list')
        data = {
            'team': self.team.id,
            'description': 'Hack attempt',
            'repository_url': 'https://github.com/evil/repo'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Você não é membro desta equipe', str(response.data['detail']))

    def test_submission_wrong_status_fails(self):
        self.hackathon.status = 'COMPLETED'
        self.hackathon.save()
        
        self.client.force_authenticate(user=self.user_member)
        url = reverse('submission-list')
        data = {
            'team': self.team.id,
            'description': 'Late project',
            'repository_url': 'https://github.com/test/repo'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('hackathons em andamento', str(response.data['detail']))

    def test_submission_after_deadline_fails(self):
        self.hackathon.end_date = timezone.now() - timedelta(minutes=1)
        self.hackathon.save()
        
        self.client.force_authenticate(user=self.user_member)
        url = reverse('submission-list')
        data = {
            'team': self.team.id,
            'description': 'Very late project',
            'repository_url': 'https://github.com/test/repo'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('prazo de submissão', str(response.data['detail']))
