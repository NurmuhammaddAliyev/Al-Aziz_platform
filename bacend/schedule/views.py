from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from accounts.models import CustomUser
from accounts.permissions import IsTeacherOrAdmin
from students.models import StudentProfile

from .models import Schedule
from .serializers import ScheduleSerializer


class ScheduleViewSet(viewsets.ModelViewSet):
    # Keep a safe base queryset at module import time. We avoid selecting 'teacher' here
    # to prevent select_related validation issues in some environments; views can
    # add select_related at runtime if needed.
    queryset = Schedule.objects.select_related('subject', 'class_group').all()
    serializer_class = ScheduleSerializer

    def get_permissions(self):
        if self.action in {'create', 'update', 'partial_update', 'destroy'}:
            return [IsTeacherOrAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if (
            user.is_authenticated
            and getattr(user, 'role', None) == CustomUser.Role.STUDENT
            and not (user.is_staff or user.is_superuser)
        ):
            if hasattr(user, 'student_profile'):
                student_profile = user.student_profile
                class_group = student_profile.class_group
                class_name = student_profile.class_name
            else:
                class_group = None
                class_name = ''
            if class_group:
                return self.queryset.filter(class_group=class_group, is_active=True)
            return self.queryset.filter(class_name=class_name, is_active=True)
        return super().get_queryset()
