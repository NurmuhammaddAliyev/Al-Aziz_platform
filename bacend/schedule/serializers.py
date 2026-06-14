from rest_framework import serializers

from .models import Schedule


class ScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = [
            'id',
            'class_group',
            'class_name',
            'day',
            'subject',
            'start_time',
            'end_time',
            'room',
            'teacher',
            'is_active',
        ]
        read_only_fields = ['id']
