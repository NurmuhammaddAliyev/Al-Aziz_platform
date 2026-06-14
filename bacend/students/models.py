from django.conf import settings
from django.db import models


class ClassGroup(models.Model):
    name = models.CharField(max_length=50, unique=True)


grade_level = models.CharField(max_length=20, blank=True)
teacher = models.ForeignKey(
    settings.AUTH_USER_MODEL,
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name='class_groups',
)
is_active = models.BooleanField(default=True)
created_at = models.DateTimeField(auto_now_add=True)


class Meta:
    ordering = ['name']


def __str__(self):
    return self.name


class StudentProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='student_profile',
    )
    class_group = models.ForeignKey(
        ClassGroup,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='students',
    )
    class_name = models.CharField(max_length=50, blank=True)
    phone = models.CharField(max_length=20, blank=True, default='')
    photo = models.ImageField(upload_to='students/', blank=True, null=True)
    joined_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['user__last_name', 'user__first_name', 'user__username']

    def __str__(self):
        return f'{self.user.get_full_name() or self.user.username} - {self.display_class_name}'

    @property
    def display_class_name(self):
        return self.class_group.name if self.class_group else self.class_name


class CourseEnrollment(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Kutilmoqda'
        APPROVED = 'approved', 'Tasdiqlangan'
        REJECTED = 'rejected', 'Rad etilgan'

    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='course_enrollments',
    )
    phone = models.CharField(max_length=20, blank=True)
    subject = models.ForeignKey(
        'subjects.Subject',
        on_delete=models.CASCADE,
        related_name='enrollments',
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['student', 'subject'],
                name='unique_student_subject_enrollment'
            )
        ]
        verbose_name = 'Kurs Registratsiyasi'
        verbose_name_plural = 'Kurs Registratsiyalari'

    def __str__(self):
        return f'{self.student} -> {self.subject} ({self.status})'

    def get_status_display_uz(self):
        """Uzbek tilidagi status"""
        return dict(self.Status.choices).get(self.status, self.status)
