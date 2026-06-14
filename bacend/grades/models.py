from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Grade(models.Model):
    class Scale(models.TextChoices):
        FIVE = 'five', '1-5'
        PERCENT = 'percent', '100%'

    student = models.ForeignKey('students.StudentProfile', on_delete=models.CASCADE, related_name='grades')
    subject = models.ForeignKey('subjects.Subject', on_delete=models.CASCADE, related_name='grades')
    score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    scale = models.CharField(max_length=20, choices=Scale.choices, default=Scale.FIVE)
    date = models.DateField(db_index=True)
    note = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_grades',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', 'student__user__last_name']
        constraints = [
            models.CheckConstraint(
                check=models.Q(score__gte=0, score__lte=100),
                name='grade_score_valid_range'
            )
        ]

    def __str__(self):
        return f'{self.student} - {self.subject} - {self.score}'
