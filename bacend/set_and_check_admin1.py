#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import CustomUser
from django.contrib.auth import authenticate
import requests

USERNAME = 'admin1'
NEW_PASSWORD = '12345'

# Ensure user exists and set password
try:
    u = CustomUser.objects.get(username=USERNAME)
    u.set_password(NEW_PASSWORD)
    u.save()
    print(f"✅ Set password for {USERNAME} -> {NEW_PASSWORD}")
except CustomUser.DoesNotExist:
    print(f"❌ User {USERNAME} not found. Creating user with admin role.")
    u = CustomUser.objects.create_superuser(username=USERNAME, email='', password=NEW_PASSWORD, role='admin')
    print(f"✅ Created {USERNAME} as superuser")

# Verify authentication via Django auth
user = authenticate(username=USERNAME, password=NEW_PASSWORD)
print('Django authenticate ->', 'OK' if user else 'FAILED')

# Test token endpoint and /api/auth/me/
try:
    token_url = 'http://127.0.0.1:8000/api/auth/token/'
    me_url = 'http://127.0.0.1:8000/api/auth/me/'
    r = requests.post(token_url, json={'username': USERNAME, 'password': NEW_PASSWORD}, timeout=5)
    print(f"Token endpoint status: {r.status_code}")
    print('Token response:', r.text)
    if r.status_code == 200:
        data = r.json()
        access = data.get('access')
        headers = {'Authorization': f'Bearer {access}'}
        r2 = requests.get(me_url, headers=headers, timeout=5)
        print(f"/api/auth/me/ status: {r2.status_code}")
        print('/api/auth/me/ response:', r2.text)
    else:
        print('Token obtan failed')
except Exception as e:
    print('HTTP test error:', e)
