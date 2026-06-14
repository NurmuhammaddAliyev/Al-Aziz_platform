import requests
import json

print("=" * 60)
print("REGISTRATION TEST")
print("=" * 60)

# 1. Check if API is responding
try:
    response = requests.get('http://127.0.0.1:8000/api/subjects/', timeout=5)
    print(f"✅ Backend is running - Status: {response.status_code}")
except Exception as e:
    print(f"❌ Backend NOT running - Error: {e}")
    exit()

# 2. Try registration
try:
    response = requests.post(
        'http://127.0.0.1:8000/api/auth/register/',
        json={
            'username': 'testuser999',
            'password': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User',
            'email': 'test999@example.com',
            'phone': '+998901234567'
        },
        timeout=5
    )
    
    print(f"\n📨 Registration Response:")
    print(f"   Status Code: {response.status_code}")
    print(f"   Response: {response.text}")
    
    if response.status_code == 201:
        print("\n✅ REGISTRATION SUCCESSFUL!")
        data = response.json()
        print(f"   User: {data.get('user', {}).get('username')}")
        print(f"   Token: {data.get('access', 'N/A')[:50]}...")
    else:
        print(f"\n❌ REGISTRATION FAILED!")
        try:
            print(f"   Errors: {response.json()}")
        except:
            print(f"   Response: {response.text}")
            
except Exception as e:
    print(f"❌ Request Error: {e}")

print("=" * 60)
