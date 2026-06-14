from rest_framework import serializers

from .models import Grade


class GradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = ['id', 'student', 'subject', 'score', 'scale', 'date', 'note', 'created_by', 'created_at']
        read_only_fields = ['id', 'created_by', 'created_at']
