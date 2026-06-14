import csv
from datetime import timedelta

from django.db.models import Avg, Count, Q
from django.http import HttpResponse
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsTeacherOrAdmin
from attendance.models import Attendance
from grades.models import Grade
from schedule.models import Schedule
from students.models import ClassGroup, StudentProfile
from subjects.models import Subject


def _class_label(student=None, schedule=None, group=None):
    if group:
        return group.name
    if student and student.class_group:
        return student.class_group.name
    if schedule and schedule.class_group:
        return schedule.class_group.name
    if student and student.class_name:
        return student.class_name
    if schedule and schedule.class_name:
        return schedule.class_name
    return 'Aniqlanmagan'


def _collect_class_entries():
    entries = {}

    for group in ClassGroup.objects.select_related('teacher').prefetch_related('students', 'schedule_items').all():
        entries[group.name] = {
            'label': group.name,
            'group': group,
        }

    for student in StudentProfile.objects.select_related('class_group').all():
        label = _class_label(student=student)
        if label == 'Aniqlanmagan':
            continue
        entries.setdefault(label, {'label': label, 'group': None})

    for schedule in Schedule.objects.select_related('class_group').all():
        label = _class_label(schedule=schedule)
        if label == 'Aniqlanmagan':
            continue
        entries.setdefault(label, {'label': label, 'group': None})

    return list(entries.values())


class DashboardStatsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.localdate()
        week_start = today - timedelta(days=today.weekday())

        students = StudentProfile.objects.count()
        class_groups = ClassGroup.objects.count()
        active_subjects = Subject.objects.filter(is_active=True).count()
        total_attendance_today = Attendance.objects.filter(date=today).count()
        present_today = Attendance.objects.filter(date=today, status=Attendance.Status.PRESENT).count()
        absent_today = Attendance.objects.filter(date=today, status=Attendance.Status.ABSENT).count()
        late_today = Attendance.objects.filter(date=today, status=Attendance.Status.LATE).count()
        grades_avg = Grade.objects.aggregate(avg=Avg('score'))['avg'] or 0
        weekly_schedule = Schedule.objects.filter(is_active=True).count()

        attendance_rate = round((present_today / total_attendance_today) * 100, 2) if total_attendance_today else 0

        return Response(
            {
                'students': students,
                'class_groups': class_groups,
                'active_subjects': active_subjects,
                'present_today': present_today,
                'absent_today': absent_today,
                'late_today': late_today,
                'attendance_rate_today': attendance_rate,
                'average_grade': round(float(grades_avg), 2),
                'weekly_schedule_items': weekly_schedule,
                'week_start': week_start,
            }
        )


class AbsenceAlertAPIView(APIView):
    permission_classes = [IsTeacherOrAdmin]

    def get(self, request):
        alerts = []
        for student in StudentProfile.objects.select_related('user', 'class_group').all():
            last_three = list(
                Attendance.objects.filter(student=student).order_by('-date').values_list('status', flat=True)[:3]
            )
            if len(last_three) == 3 and all(status == Attendance.Status.ABSENT for status in last_three):
                alerts.append(
                    {
                        'student_id': student.id,
                        'name': student.user.get_full_name() or student.user.username,
                        'class_name': _class_label(student=student),
                    }
                )

        return Response({'alerts': alerts, 'count': len(alerts)})


class ClassSummaryAPIView(APIView):
    permission_classes = [IsTeacherOrAdmin]

    def get(self, request):
        summaries = []
        for entry in _collect_class_entries():
            label = entry['label']
            group = entry['group']

            if group:
                students_qs = group.students.select_related('user', 'class_group').filter(is_active=True)
                schedule_qs = group.schedule_items.filter(is_active=True)
            else:
                students_qs = StudentProfile.objects.select_related('user', 'class_group').filter(
                    class_group__isnull=True,
                    class_name=label,
                    is_active=True,
                )
                schedule_qs = Schedule.objects.filter(class_group__isnull=True, class_name=label, is_active=True)

            student_ids = list(students_qs.values_list('id', flat=True))
            avg_grade = (
                Grade.objects.filter(student_id__in=student_ids).aggregate(avg=Avg('score'))['avg'] or 0
                if student_ids
                else 0
            )
            attendance_today = Attendance.objects.filter(student_id__in=student_ids, date=timezone.localdate())

            summaries.append(
                {
                    'label': label,
                    'group_id': group.id if group else None,
                    'students': students_qs.count(),
                    'schedule_items': schedule_qs.count(),
                    'average_grade': round(float(avg_grade), 2),
                    'present_today': attendance_today.filter(status=Attendance.Status.PRESENT).count(),
                    'absent_today': attendance_today.filter(status=Attendance.Status.ABSENT).count(),
                    'late_today': attendance_today.filter(status=Attendance.Status.LATE).count(),
                }
            )

        return Response({'items': summaries, 'count': len(summaries)})


class AttendanceExportAPIView(APIView):
    permission_classes = [IsTeacherOrAdmin]

    def get(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="attendance_export.csv"'

        writer = csv.writer(response)
        # Export columns: Student, Course(s), Group, Date, Attendance
        writer.writerow(['Student', 'Course(s)', 'Group', 'Date', 'Attendance'])

        # Prefetch student enrollments to list their courses efficiently
        rows = (
            Attendance.objects.select_related('student__user', 'student__class_group')
            .prefetch_related('student__course_enrollments__subject')
            .order_by('-date')
        )

        for record in rows:
            student = record.student
            # collect enrolled subject names (if any)
            enrollments = getattr(student, 'course_enrollments', None)
            if enrollments is not None:
                courses = ', '.join([e.subject.name for e in enrollments.all()])
            else:
                courses = ''

            group_label = student.class_group.name if student.class_group else student.class_name or ''
            attendance_label = student.user.get_full_name() if student and student.user else ''

            # Use the human readable status (labels in model choices)
            status_display = record.get_status_display()

            writer.writerow([
                record.student.user.get_full_name() or record.student.user.username,
                courses,
                group_label,
                record.date,
                status_display,
            ])

        return response


class GradesExportAPIView(APIView):
    permission_classes = [IsTeacherOrAdmin]

    def get(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="grades_export.csv"'

        writer = csv.writer(response)
        writer.writerow(['Student', 'Class', 'Subject', 'Score', 'Scale', 'Date', 'Note', 'Created By'])

        rows = Grade.objects.select_related('student__user', 'student__class_group', 'subject', 'created_by').order_by(
            '-date'
        )
        for record in rows:
            writer.writerow(
                [
                    record.student.user.get_full_name() or record.student.user.username,
                    _class_label(student=record.student),
                    record.subject.name,
                    record.score,
                    record.scale,
                    record.date,
                    record.note,
                    record.created_by.get_full_name() if record.created_by else '',
                ]
            )

        return response
