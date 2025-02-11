from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from .models import User

class UserTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='testpass')

    def test_user_registration(self):
        response = self.client.post('/api/register/', {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpass',
            'role': 'employee'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_approve_user(self):
        response = self.client.post(f'/api/approve-user/{self.user.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)