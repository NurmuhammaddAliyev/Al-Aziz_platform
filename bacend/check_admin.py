#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import CustomUser
from django.contrib.auth import authenticate

# Check if admin exists
admin = CustomUser.objects.filter(username='admin').first()
if admin:
    print(f"✅ Admin found: {admin.username}, role={admin.role}, is_staff={admin.is_staff}")
    
    # Test authenticate
    user = authenticate(username='admin', password='admin123')
    if user:
        print(f"✅ Authentication works! User: {user.username}")
    else:
        print("❌ Authentication failed! Password incorrect or user disabled")
else:
    print("❌ Admin user not found")

# List all users
print("\n📋 All users in database:")
for u in CustomUser.objects.all():
    print(f"   {u.username}: role={u.role}, is_active={u.is_active}, is_staff={u.is_staff}")
