from django.conf import settings
from django.db import models


class Attendance(models.Model):
    class Status(models.TextChoices):
        PRESENT = 'present', 'Keldi'
        ABSENT = 'absent', 'Kelmadi'
        LATE = 'late', 'Kech qoldi'

    student = models.ForeignKey('students.StudentProfile', on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField(db_index=True)
    status = models.CharField(max_length=20, choices=Status.choices)
    note = models.TextField(blank=True)
    recorded_by = models.ForeignKey(
     settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recorded_attendance',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['student', 'date'],
                name='unique_student_date_attendance'
            )
        ]
        ordering = ['-date', 'student__user__last_name']

    def __str__(self):
        return f'{self.student} - {self.date} - {self.status}'
