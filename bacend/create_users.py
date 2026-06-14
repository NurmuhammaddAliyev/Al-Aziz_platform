#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from students.models import StudentProfile

User = get_user_model()

# Admin user yaratish
admin_password = os.getenv('INITIAL_ADMIN_PASSWORD')
if not User.objects.filter(username='admin').exists():
    if not admin_password:
        print("⚠️ Skipped creating admin: set INITIAL_ADMIN_PASSWORD environment variable")
    else:
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password=admin_password,
            first_name='Admin',
            last_name='User',
            role='admin'
        )
        print(f"✅ Admin user yaratildi: {admin.username}")
else:
    print("ℹ️ Admin user allaqachon mavjud")

# Test user (Student)
test_password = os.getenv('INITIAL_TEST_USER_PASSWORD')
if not User.objects.filter(username='testuser').exists():
    if not test_password:
        print("⚠️ Skipped creating testuser: set INITIAL_TEST_USER_PASSWORD environment variable")
    else:
        student = User.objects.create_user(
            username='testuser',
            email='student@example.com',
            password=test_password,
            first_name='Test',
            last_name='Student',
            role='student'
        )
        StudentProfile.objects.get_or_create(user=student)
        print(f"✅ Student user yaratildi: {student.username}")

# Test teacher
teacher_password = os.getenv('INITIAL_TEACHER_PASSWORD')
if not User.objects.filter(username='teacher').exists():
    if not teacher_password:
        print("⚠️ Skipped creating teacher: set INITIAL_TEACHER_PASSWORD environment variable")
    else:
        teacher = User.objects.create_user(
            username='teacher',
            email='teacher@example.com',
            password=teacher_password,
            first_name='Test',
            last_name='Teacher',
            role='teacher'
        )
        print(f"✅ Teacher user yaratildi: {teacher.username}")

print("\n📋 Barcha Users:")
for user in User.objects.all():
    print(f"  - {user.username} ({user.role})")
