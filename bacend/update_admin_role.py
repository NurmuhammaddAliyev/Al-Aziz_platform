#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import CustomUser

# Update admin1 user role to admin
try:
    user = CustomUser.objects.get(username='admin1')
    user.role = 'admin'
    user.save()
    print(f'✅ Updated admin1 role to: {user.role}')
except CustomUser.DoesNotExist:
    print('❌ admin1 user not found')
    
# Show all users
print('\n📋 All users:')
for user in CustomUser.objects.all():
    print(f'   {user.username}: role={user.role}, is_staff={user.is_staff}, is_superuser={user.is_superuser}')
