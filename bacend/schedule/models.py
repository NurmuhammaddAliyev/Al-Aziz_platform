from django.db import models


class Schedule(models.Model):
    class WeekDay(models.TextChoices):
        MONDAY = 'monday', 'Dushanba'
        TUESDAY = 'tuesday', 'Seshanba'
        WEDNESDAY = 'wednesday', 'Chorshanba'
        THURSDAY = 'thursday', 'Payshanba'
        FRIDAY = 'friday', 'Juma'
        SATURDAY = 'saturday', 'Shanba'
        SUNDAY = 'sunday', 'Yakshanba'

    class_group = models.ForeignKey(
        'students.ClassGroup',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='schedule_items',
    )
    class_name = models.CharField(max_length=50)
    day = models.CharField(max_length=20, choices=WeekDay.choices)
    subject = models.ForeignKey('subjects.Subject', on_delete=models.CASCADE, related_name='schedule_items')
    start_time = models.TimeField()
    end_time = models.TimeField()
    room = models.CharField(max_length=50, blank=True)
    teacher = models.ForeignKey(
        'accounts.CustomUser',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='taught_lessons',
        limit_choices_to={'role': 'teacher'},
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['day', 'start_time']
        constraints = [
            models.UniqueConstraint(
                fields=['class_name', 'day', 'start_time'],
                name='unique_schedule_slot'
            ),
            models.CheckConstraint(
                check=models.Q(start_time__lt=models.F('end_time')),
                name='start_before_end_time'
            )
        ]

    def __str__(self):
        return f'{self.display_class_name} - {self.get_day_display()} - {self.subject}'

    @property
    def display_class_name(self):
        return self.class_group.name if self.class_group else self.class_name
