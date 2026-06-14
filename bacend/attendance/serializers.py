from rest_framework import serializers

from .models import Attendance


class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = ['id', 'student', 'date', 'status', 'note', 'recorded_by', 'created_at']
        read_only_fields = ['id', 'recorded_by', 'created_at']
