from datetime import time, timedelta

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from attendance.models import Attendance
from grades.models import Grade
from schedule.models import Schedule
from students.models import ClassGroup, StudentProfile
from subjects.models import Subject


User = get_user_model()


class Command(BaseCommand):
    help = 'Seed demo data for testing the platform.'

    @transaction.atomic
    def handle(self, *args, **options):
        today = timezone.localdate()

        groups = {}
        for group_name in ['Teachers', 'Students', 'Managers']:
            group, _ = Group.objects.get_or_create(name=group_name)
            groups[group_name] = group

        admin_user, _ = User.objects.get_or_create(
            username='admin',
            defaults={
                'first_name': 'Admin',
                'last_name': 'User',
                'email': 'admin@example.com',
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True,
            },
        )
        admin_user.set_password('Admin12345!')
        admin_user.role = User.Role.ADMIN
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.save()
        admin_user.groups.add(groups['Managers'])

        teacher_user, _ = User.objects.get_or_create(
            username='teacher1',
            defaults={
                'first_name': 'Ali',
                'last_name': 'Karimov',
                'email': 'teacher1@example.com',
                'role': User.Role.TEACHER,
                'phone': '+998901112233',
            },
        )
        teacher_user.set_password('Teacher123!')
        teacher_user.role = User.Role.TEACHER
        teacher_user.is_staff = True
        teacher_user.save()
        teacher_user.groups.add(groups['Teachers'])

        student_specs = [
            {
                'username': 'student1',
                'first_name': 'Aziz',
                'last_name': 'Tursunov',
                'email': 'student1@example.com',
                'class_name': '7-A',
                'phone': '+998901000001',
            },
            {
                'username': 'student2',
                'first_name': 'Javohir',
                'last_name': 'Rasulov',
                'email': 'student2@example.com',
                'class_name': '7-A',
                'phone': '+998901000002',
            },
            {
                'username': 'student3',
                'first_name': 'Madina',
                'last_name': 'Ergasheva',
                'email': 'student3@example.com',
                'class_name': '8-B',
                'phone': '+998901000003',
            },
        ]

        students = []
        class_groups = {}
        for class_name in ['7-A', '8-B']:
            class_group, _ = ClassGroup.objects.get_or_create(name=class_name)
            class_groups[class_name] = class_group

        for spec in student_specs:
            user, _ = User.objects.get_or_create(
                username=spec['username'],
            defaults={
                    'first_name': spec['first_name'],
                    'last_name': spec['last_name'],
                    'email': spec['email'],
                    'role': User.Role.STUDENT,
                    'phone': spec['phone'],
            },
        )
            user.set_password('Student123!')
            user.role = User.Role.STUDENT
            user.phone = spec['phone']
            user.save()
            user.groups.add(groups['Students'])

            profile, _ = StudentProfile.objects.get_or_create(user=user)
            profile.class_name = spec['class_name']
            profile.class_group = class_groups.get(spec['class_name'])
            profile.phone = spec['phone']
            profile.save()
            students.append(profile)

        subject_specs = [
            {'name': 'Matematika', 'code': 'MATH', 'duration_months': 6, 'monthly_price': 450000},
            {'name': 'Ingliz tili', 'code': 'ENG', 'duration_months': 8, 'monthly_price': 550000},
            {'name': 'Informatika', 'code': 'IT', 'duration_months': 10, 'monthly_price': 650000},
        ]
        subjects = []
        for spec in subject_specs:
            subject, _ = Subject.objects.get_or_create(
                name=spec['name'],
                defaults={
                    'code': spec['code'],
                    'teacher': teacher_user,
                    'duration_months': spec['duration_months'],
                    'monthly_price': spec['monthly_price'],
                },
            )
            if not subject.code:
                subject.code = spec['code']
            subject.teacher = teacher_user
            subject.duration_months = spec['duration_months']
            subject.monthly_price = spec['monthly_price']
            subject.save()
            subjects.append(subject)

        schedule_specs = [
            ('7-A', Schedule.WeekDay.MONDAY, subjects[0], time(8, 0), time(8, 45), '101'),
            ('7-A', Schedule.WeekDay.MONDAY, subjects[1], time(9, 0), time(9, 45), '101'),
            ('8-B', Schedule.WeekDay.TUESDAY, subjects[2], time(10, 0), time(10, 45), '202'),
        ]
        for class_name, day, subject, start_time, end_time, room in schedule_specs:
            schedule, _ = Schedule.objects.get_or_create(
                class_name=class_name,
                day=day,
                start_time=start_time,
                defaults={
                    'end_time': end_time,
                    'subject': subject,
                    'room': room,
                    'teacher': teacher_user,
                    'is_active': True,
                    'class_group': class_groups.get(class_name),
                },
            )
            if schedule.class_group_id is None:
                schedule.class_group = class_groups.get(class_name)
                schedule.save(update_fields=['class_group'])

        attendance_specs = [
            (students[0], today - timedelta(days=2), Attendance.Status.PRESENT),
            (students[0], today - timedelta(days=1), Attendance.Status.ABSENT),
            (students[0], today, Attendance.Status.ABSENT),
            (students[1], today - timedelta(days=2), Attendance.Status.LATE),
            (students[1], today - timedelta(days=1), Attendance.Status.PRESENT),
            (students[1], today, Attendance.Status.PRESENT),
            (students[2], today - timedelta(days=2), Attendance.Status.ABSENT),
            (students[2], today - timedelta(days=1), Attendance.Status.ABSENT),
            (students[2], today, Attendance.Status.ABSENT),
        ]
        for student, date_value, status in attendance_specs:
            Attendance.objects.get_or_create(
                student=student,
                date=date_value,
                defaults={
                    'status': status,
                    'recorded_by': teacher_user,
                    'note': 'Demo data',
                },
            )

        grade_specs = [
            (students[0], subjects[0], 4.50, 'five', today - timedelta(days=1)),
            (students[0], subjects[1], 87.00, 'percent', today),
            (students[1], subjects[0], 3.75, 'five', today - timedelta(days=1)),
            (students[1], subjects[2], 92.00, 'percent', today),
            (students[2], subjects[1], 5.00, 'five', today - timedelta(days=2)),
        ]
        for student, subject, score, scale, date_value in grade_specs:
            grade_qs = Grade.objects.filter(student=student, subject=subject, date=date_value).order_by('id')
            grade = grade_qs.first()
            if grade:
                grade.score = score
                grade.scale = scale
                grade.created_by = teacher_user
                grade.note = 'Demo data'
                grade.save()
                if grade_qs.count() > 1:
                    grade_qs.exclude(pk=grade.pk).delete()
            else:
                Grade.objects.create(
                    student=student,
                    subject=subject,
                    date=date_value,
                    score=score,
                    scale=scale,
                    created_by=teacher_user,
                    note='Demo data',
                )

        self.stdout.write(self.style.SUCCESS('Demo data created successfully.'))
        self.stdout.write(f'Groups: {Group.objects.count()}')
        self.stdout.write(f'Class groups: {ClassGroup.objects.count()}')
        self.stdout.write(f'Users: {User.objects.count()}')
        self.stdout.write(f'Students: {StudentProfile.objects.count()}')
        self.stdout.write(f'Subjects: {Subject.objects.count()}')
        self.stdout.write(f'Schedule items: {Schedule.objects.count()}')
        self.stdout.write(f'Attendance records: {Attendance.objects.count()}')
        self.stdout.write(f'Grades: {Grade.objects.count()}')
