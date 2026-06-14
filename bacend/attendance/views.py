from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from accounts.models import CustomUser
from accounts.permissions import IsTeacherOrAdmin

from .models import Attendance
from .serializers import AttendanceSerializer


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.select_related('student__user', 'recorded_by').all()
    serializer_class = AttendanceSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'date']
    search_fields = ['student__user__username', 'student__user__first_name', 'student__user__last_name']
    ordering_fields = ['date', 'created_at', 'status']
    ordering = ['-date']

    def get_permissions(self):
        if self.action in {'create', 'update', 'partial_update', 'destroy'}:
            return [IsTeacherOrAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if (
            user.is_authenticated
            and getattr(user, 'role', None) == CustomUser.Role.STUDENT
            and not (user.is_staff or user.is_superuser)
        ):
            return queryset.filter(student__user=user)
        return queryset

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)
