import requests

# Test registration
response = requests.post(
    'http://localhost:8000/api/auth/register/',
    json={
        'username': 'newuser123',
        'password': 'test123456',
        'first_name': 'Test',
        'last_name': 'User',
        'email': 'test123@example.com',
        'phone': '+998901234567'
    }
)

print(f'Status: {response.status_code}')
print(f'Response:')
print(response.text)
