import requests

# Admin login
response = requests.post(
    'http://localhost:8000/api/auth/token/',
    json={
        'username': 'admin',
        'password': 'admin123456'
    }
)
print(f'Status: {response.status_code}')
print(f'Response: {response.text}')

if response.status_code == 200:
    data = response.json()
    print(f'\n✅ Login successful!')
    access_token = data['access']
    print(f'Access Token: {access_token[:50]}...')
    
    # Enrollments ni ko'rish
    print('\n' + '='*50)
    print('Enrollments ni ko\'rish:')
    response2 = requests.get(
        'http://localhost:8000/api/enrollments/',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    print(f'Status: {response2.status_code}')
    print(f'Response: {response2.json()}')
