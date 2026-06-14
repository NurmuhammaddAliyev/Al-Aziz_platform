from rest_framework import serializers

from .models import Subject


class SubjectSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()
    teacher_phone = serializers.SerializerMethodField()

    class Meta:
        model = Subject
        fields = [
            'id',
            'name',
            'code',
            'teacher',
            'teacher_name',
            'teacher_phone',
            'duration_months',
            'monthly_price',
            'is_active',
        ]
        read_only_fields = ['id']

    def get_teacher_name(self, obj):
        if obj.teacher:
            return obj.teacher.get_full_name() or obj.teacher.username
        return None

    def get_teacher_phone(self, obj):
        return obj.teacher.phone if obj.teacher else None
