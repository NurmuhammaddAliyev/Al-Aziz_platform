from django.db.models import Count
from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from accounts.models import CustomUser
from accounts.permissions import IsTeacherOrAdmin

from .models import ClassGroup, CourseEnrollment, StudentProfile
from .serializers import (
    ClassGroupSerializer,
    CourseEnrollmentSerializer,
    StudentCreateSerializer,
    StudentProfileSerializer,
)


class ClassGroupViewSet(viewsets.ModelViewSet):
    # Avoid select_related('teacher') at import-time to prevent FieldError in some environments.
    queryset = ClassGroup.objects.annotate(student_count=Count('students', distinct=True))
    serializer_class = ClassGroupSerializer

    def get_permissions(self):
        if self.action in {'list', 'retrieve'}:
            return [AllowAny()]
        if self.action in {'create', 'update', 'partial_update', 'destroy'}:
            return [IsTeacherOrAdmin()]
        return [IsAuthenticated()]


class StudentViewSet(viewsets.ModelViewSet):
    queryset = StudentProfile.objects.select_related('user', 'class_group').all()

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
            return StudentProfile.objects.select_related('user', 'class_group').filter(user=user)
        return super().get_queryset()

    def get_serializer_class(self):
        if self.action == 'create':
            return StudentCreateSerializer
        return StudentProfileSerializer


class CourseEnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = CourseEnrollmentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'subject']
    search_fields = ['student__user__username', 'student__user__first_name', 'student__user__last_name', 'subject__name']
    ordering_fields = ['created_at', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = CourseEnrollment.objects.select_related('student__user', 'student__class_group', 'subject').all()
        user = self.request.user
        if (
            user.is_authenticated
            and getattr(user, 'role', None) == CustomUser.Role.STUDENT
            and not (user.is_staff or user.is_superuser)
        ):
            return queryset.filter(student__user=user)
        return queryset

    def get_permissions(self):
        if self.action in {'create'}:
            return [IsAuthenticated()]
        if self.action in {'update', 'partial_update', 'destroy'}:
            return [IsTeacherOrAdmin()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        """Yangi enrollment qo'shganda student avtomatik qo'shiladi"""
        serializer.save()

    def perform_update(self, serializer):
        """Statusni o'zgartirish (approval/rejection)"""
        serializer.save()
