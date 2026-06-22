from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from apps.hackathons.models import Hackathon
from .models import Team, TeamMember, TeamJoinRequest
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

    def test_prevent_leading_two_teams_same_hackathon(self):
        # user1 já lidera uma equipe (sem ser membro de outra via M2M direto)
        Team.objects.create(name='Lead 1', hackathon=self.hackathon, leader=self.user1)

        self.client.force_authenticate(user=self.user1)
        url = reverse('team-list')
        data = {'name': 'Lead 2', 'hackathon': self.hackathon.id}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_only_leader_can_edit_team(self):
        team = Team.objects.create(name='Owned', hackathon=self.hackathon, leader=self.user1)
        TeamMember.objects.create(team=team, user=self.user1)

        # Não-líder não pode editar
        self.client.force_authenticate(user=self.user2)
        url = reverse('team-detail', args=[team.id])
        response = self.client.patch(url, {'name': 'Hacked'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Líder pode editar
        self.client.force_authenticate(user=self.user1)
        response = self.client.patch(url, {'name': 'Renamed'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        team.refresh_from_db()
        self.assertEqual(team.name, 'Renamed')

    def test_join_request_flow_approve(self):
        team = Team.objects.create(name='Squad', hackathon=self.hackathon, leader=self.user1)
        TeamMember.objects.create(team=team, user=self.user1)

        # user2 solicita entrada
        self.client.force_authenticate(user=self.user2)
        url = reverse('team-request-join', args=[team.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(team.join_requests.filter(status='PENDING').count(), 1)

        # Solicitação duplicada é bloqueada
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        join_request = team.join_requests.first()

        # Não-líder não vê solicitações
        list_url = reverse('team-list-requests', args=[team.id])
        response = self.client.get(list_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Líder aprova
        self.client.force_authenticate(user=self.user1)
        respond_url = reverse('team-respond-request', args=[team.id, join_request.id])
        response = self.client.post(respond_url, {'approve': True}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        join_request.refresh_from_db()
        self.assertEqual(join_request.status, TeamJoinRequest.Status.APPROVED)
        self.assertEqual(team.members.count(), 2)

    def test_join_request_flow_reject(self):
        team = Team.objects.create(name='Squad', hackathon=self.hackathon, leader=self.user1)
        TeamMember.objects.create(team=team, user=self.user1)
        join_request = TeamJoinRequest.objects.create(team=team, user=self.user2)

        self.client.force_authenticate(user=self.user1)
        respond_url = reverse('team-respond-request', args=[team.id, join_request.id])
        response = self.client.post(respond_url, {'approve': False}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        join_request.refresh_from_db()
        self.assertEqual(join_request.status, TeamJoinRequest.Status.REJECTED)
        self.assertEqual(team.members.count(), 1)

    def test_member_can_leave_but_leader_cannot(self):
        team = Team.objects.create(name='Squad', hackathon=self.hackathon, leader=self.user1)
        TeamMember.objects.create(team=team, user=self.user1)
        TeamMember.objects.create(team=team, user=self.user2)

        # Membro comum sai
        self.client.force_authenticate(user=self.user2)
        url = reverse('team-leave', args=[team.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(team.members.count(), 1)

        # Líder não pode sair
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_leader_removes_member(self):
        team = Team.objects.create(name='Squad', hackathon=self.hackathon, leader=self.user1)
        TeamMember.objects.create(team=team, user=self.user1)
        TeamMember.objects.create(team=team, user=self.user2)

        # Não-líder não pode remover
        self.client.force_authenticate(user=self.user2)
        url = reverse('team-remove-member', args=[team.id, self.user1.id])
        self.assertEqual(self.client.post(url).status_code, status.HTTP_403_FORBIDDEN)

        # Líder remove o membro
        self.client.force_authenticate(user=self.user1)
        url = reverse('team-remove-member', args=[team.id, self.user2.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(team.members.count(), 1)

    def test_search_teams_by_name(self):
        Team.objects.create(name='Alpha Squad', hackathon=self.hackathon, leader=self.user1)
        Team.objects.create(name='Beta Crew', hackathon=self.hackathon, leader=self.user2)

        self.client.force_authenticate(user=self.user1)
        url = reverse('team-list')
        response = self.client.get(url, {'search': 'alpha'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Alpha Squad')
