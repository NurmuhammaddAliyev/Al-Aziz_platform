from django.contrib import admin
from django import forms
from django.contrib.auth import get_user_model

from .models import Schedule


class ScheduleForm(forms.ModelForm):
    class Meta:
        model = Schedule
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        User = get_user_model()
        # Ensure the teacher select lists users who have role='teacher'
        try:
            self.fields['teacher'].queryset = User.objects.filter(role='teacher')
        except Exception:
            # If role field or model changes, fallback to default queryset
            pass


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    form = ScheduleForm
    list_display = ('id', 'class_group', 'class_name', 'day', 'subject', 'start_time', 'end_time', 'room', 'teacher', 'is_active')
    list_filter = ('day', 'class_group', 'class_name', 'is_active')
