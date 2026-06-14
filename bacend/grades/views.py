from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from accounts.models import CustomUser
from accounts.permissions import IsTeacherOrAdmin

from .models import Grade
from .serializers import GradeSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from students.models import StudentProfile


class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.select_related('student__user', 'subject', 'created_by').all()
    serializer_class = GradeSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['subject', 'scale', 'date', 'student__class_group']
    search_fields = ['student__user__username', 'student__user__first_name', 'student__user__last_name', 'subject__name']
    ordering_fields = ['date', 'score', 'created_at']
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
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['post'], url_path='bulk-by-group')
    def bulk_by_group(self, request):
        """Create the same grade for all students in a class group.

        Payload: { class_group: <id>, subject: <id>, score: <value>, scale: <scale>, date: <YYYY-MM-DD>, note: '' }
        """
        user = request.user
        if not IsTeacherOrAdmin().has_permission(request, self):
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data
        class_group_id = data.get('class_group')
        subject = data.get('subject')
        score = data.get('score')
        scale = data.get('scale')
        date = data.get('date')
        note = data.get('note', '')

        if not all([class_group_id, subject, score, date]):
            return Response({'detail': 'class_group, subject, score and date are required.'}, status=status.HTTP_400_BAD_REQUEST)

        students = StudentProfile.objects.filter(class_group_id=class_group_id, is_active=True).select_related('user')
        created = []
        errors = []
        for sp in students:
            serializer = GradeSerializer(data={
                'student': sp.id,
                'subject': subject,
                'score': score,
                'scale': scale or Grade.Scale.FIVE,
                'date': date,
                'note': note,
            })
            if serializer.is_valid():
                serializer.save(created_by=user)
                created.append(serializer.data)
            else:
                errors.append({'student': sp.user.username, 'errors': serializer.errors})

        return Response({'created_count': len(created), 'created': created, 'errors': errors}, status=status.HTTP_201_CREATED)


