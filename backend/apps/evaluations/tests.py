from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from apps.hackathons.models import Hackathon
from apps.teams.models import Team
from apps.submissions.models import Submission
from .models import Criterion, Evaluation, Score
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class EvaluationTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(username='admin', password='password123', role='ADMIN')
        self.judge = User.objects.create_user(username='judge', password='password123', role='JUDGE')
        self.participant = User.objects.create_user(username='participant', password='password123', role='PARTICIPANT')
        
        self.hackathon = Hackathon.objects.create(
            title='Hackathon Eval',
            description='Desc',
            start_date=timezone.now() - timedelta(days=1),
            end_date=timezone.now() + timedelta(days=1),
            registration_deadline=timezone.now() - timedelta(hours=1),
            status='ONGOING'
        )
        self.hackathon.judges.add(self.judge)
        
        self.criterion1 = Criterion.objects.create(hackathon=self.hackathon, name='Innovation', weight=0.6)
        self.criterion2 = Criterion.objects.create(hackathon=self.hackathon, name='Tech', weight=0.4)
        
        self.team = Team.objects.create(name='Team 1', hackathon=self.hackathon, leader=self.participant)
        self.submission = Submission.objects.create(
            team=self.team, 
            description='Project', 
            repository_url='https://github.com'
        )

    def test_create_evaluation_success(self):
        self.client.force_authenticate(user=self.judge)
        url = reverse('evaluation-list')
        data = {
            'submission_id': self.submission.id,
            'scores': [
                {'criterion_id': self.criterion1.id, 'value': 8.0},
                {'criterion_id': self.criterion2.id, 'value': 9.0}
            ],
            'comments': 'Great job!'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Evaluation.objects.count(), 1)
        self.assertEqual(Score.objects.count(), 2)

    def test_create_evaluation_not_judge_fails(self):
        self.client.force_authenticate(user=self.participant)
        url = reverse('evaluation-list')
        data = {
            'submission_id': self.submission.id,
            'scores': [{'criterion_id': self.criterion1.id, 'value': 8.0}]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_ranking_calculation(self):
        # Adiciona avaliação via serviço para garantir consistência
        from .services import EvaluationService
        EvaluationService.create_evaluation(
            judge=self.judge,
            submission=self.submission,
            scores_data=[
                {'criterion_id': self.criterion1.id, 'value': 10.0}, # 10 * 0.6 = 6.0
                {'criterion_id': self.criterion2.id, 'value': 5.0}   # 5 * 0.4 = 2.0
            ]
        )
        
        url = reverse('ranking', kwargs={'hackathon_id': self.hackathon.id})
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # 6.0 + 2.0 = 8.0
        self.assertEqual(response.data[0]['final_score'], 8.0)
        self.assertEqual(response.data[0]['team_name'], 'Team 1')

    def test_ranking_with_multiple_judges(self):
        judge2 = User.objects.create_user(username='judge2', password='password123', role='JUDGE')
        
        # Judge 1: Innovation 10, Tech 5 -> Weighted 8.0
        # Judge 2: Innovation 8, Tech 7 -> Weighted 8.0 * 0.6 + 7.0 * 0.4 = 4.8 + 2.8 = 7.6
        # Average per criterion: Innovation (10+8)/2 = 9, Tech (5+7)/2 = 6
        # Final Score: 9 * 0.6 + 6 * 0.4 = 5.4 + 2.4 = 7.8
        
        from .services import EvaluationService
        EvaluationService.create_evaluation(
            judge=self.judge,
            submission=self.submission,
            scores_data=[
                {'criterion_id': self.criterion1.id, 'value': 10.0},
                {'criterion_id': self.criterion2.id, 'value': 5.0}
            ]
        )
        EvaluationService.create_evaluation(
            judge=judge2,
            submission=self.submission,
            scores_data=[
                {'criterion_id': self.criterion1.id, 'value': 8.0},
                {'criterion_id': self.criterion2.id, 'value': 7.0}
            ]
        )
        
        url = reverse('ranking', kwargs={'hackathon_id': self.hackathon.id})
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['final_score'], 7.8)
