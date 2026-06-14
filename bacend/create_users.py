#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from students.models import StudentProfile

User = get_user_model()

# Admin user yaratish
if not User.objects.filter(username='admin').exists():
    admin = User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='admin123456',
        first_name='Admin',
        last_name='User',
        role='admin'
    )
    print(f"✅ Admin user yaratildi: {admin.username}")
else:
    print("ℹ️ Admin user allaqachon mavjud")

# Test user (Student)
if not User.objects.filter(username='testuser').exists():
    student = User.objects.create_user(
        username='testuser',
        email='student@example.com',
        password='test123456',
        first_name='Test',
        last_name='Student',
        role='student'
    )
    StudentProfile.objects.get_or_create(user=student)
    print(f"✅ Student user yaratildi: {student.username}")

# Test teacher
if not User.objects.filter(username='teacher').exists():
    teacher = User.objects.create_user(
        username='teacher',
        email='teacher@example.com',
        password='teacher123456',
        first_name='Test',
        last_name='Teacher',
        role='teacher'
    )
    print(f"✅ Teacher user yaratildi: {teacher.username}")

print("\n📋 Barcha Users:")
for user in User.objects.all():
    print(f"  - {user.username} ({user.role})")
