from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

from apps.users.tokens import email_verification_token

User = get_user_model()

class AuthTests(APITestCase):
    def test_register_user(self):
        url = reverse('register')
        data = {
            'username': 'testuser',
            'password': 'testpassword123',
            'email': 'test@example.com',
            'role': 'PARTICIPANT',
            'has_accepted_terms': True
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().username, 'testuser')

    def test_register_ignores_privileged_role(self):
        """Auto-cadastro nunca cria papéis privilegiados, mesmo se enviados."""
        url = reverse('register')
        for sent_role in ['JUDGE', 'ADMIN', 'ORGANIZER']:
            data = {
                'username': f'user_{sent_role}',
                'password': 'testpassword123',
                'email': f'{sent_role}@example.com',
                'role': sent_role,
                'has_accepted_terms': True
            }
            response = self.client.post(url, data, format='json')
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            created = User.objects.get(username=f'user_{sent_role}')
            self.assertEqual(created.role, 'PARTICIPANT')

    def test_user_list_requires_privileged_role(self):
        participant = User.objects.create_user(username='p1', password='pw', role='PARTICIPANT')
        organizer = User.objects.create_user(username='o1', password='pw', role='ORGANIZER')
        User.objects.create_user(username='judge1', password='pw', role='JUDGE')
        url = reverse('user_list')

        # Participante é barrado
        self.client.force_authenticate(user=participant)
        self.assertEqual(self.client.get(url).status_code, status.HTTP_403_FORBIDDEN)

        # Organizador pode listar e filtrar por papel
        self.client.force_authenticate(user=organizer)
        response = self.client.get(url, {'role': 'JUDGE'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        usernames = [u['username'] for u in response.data]
        self.assertIn('judge1', usernames)
        self.assertNotIn('p1', usernames)

    def test_login_user(self):
        # First register
        user = User.objects.create_user(username='testuser', password='testpassword123')
        
        url = reverse('token_obtain_pair')
        data = {
            'username': 'testuser',
            'password': 'testpassword123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_get_me(self):
        user = User.objects.create_user(username='testuser', password='testpassword123')
        url = reverse('user_detail')

        # Test without token
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Test with token
        self.client.force_authenticate(user=user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')


class PasswordFlowTests(APITestCase):
    def test_password_reset_confirm_sets_new_password(self):
        user = User.objects.create_user(
            username='resetme', password='oldpassword123', email='reset@example.com'
        )
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        response = self.client.post(reverse('password_reset_confirm'), {
            'uid': uid, 'token': token, 'new_password': 'brandNewPass456',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertTrue(user.check_password('brandNewPass456'))

    def test_password_reset_confirm_rejects_bad_token(self):
        user = User.objects.create_user(username='resetme2', password='oldpassword123')
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        response = self.client.post(reverse('password_reset_confirm'), {
            'uid': uid, 'token': 'not-a-valid-token', 'new_password': 'brandNewPass456',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_reset_request_is_always_ok(self):
        # Non-existent e-mail must not leak account existence.
        response = self.client.post(reverse('password_reset'), {
            'email': 'nobody@example.com',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_change_password_requires_correct_old(self):
        user = User.objects.create_user(username='changeme', password='oldpassword123')
        self.client.force_authenticate(user=user)
        url = reverse('password_change')

        # Wrong current password is rejected.
        bad = self.client.post(url, {
            'old_password': 'wrong', 'new_password': 'newpassword456',
        }, format='json')
        self.assertEqual(bad.status_code, status.HTTP_400_BAD_REQUEST)

        # Correct current password succeeds.
        good = self.client.post(url, {
            'old_password': 'oldpassword123', 'new_password': 'newpassword456',
        }, format='json')
        self.assertEqual(good.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertTrue(user.check_password('newpassword456'))


class EmailVerificationTests(APITestCase):
    def test_verify_email_marks_user_verified(self):
        user = User.objects.create_user(
            username='verifyme', password='pw', email='verify@example.com'
        )
        self.assertFalse(user.is_email_verified)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = email_verification_token.make_token(user)

        response = self.client.post(reverse('verify_email'), {
            'uid': uid, 'token': token,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertTrue(user.is_email_verified)

    def test_verify_email_rejects_bad_token(self):
        user = User.objects.create_user(username='verifyme2', password='pw')
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        response = self.client.post(reverse('verify_email'), {
            'uid': uid, 'token': 'bad-token',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
