from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from accounts.permissions import IsTeacherOrAdmin

from .models import Subject
from .serializers import SubjectSerializer


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code', 'teacher__username']
    ordering_fields = ['name']
    ordering = ['name']

    def get_permissions(self):
        if self.action in {'list', 'retrieve'}:
            return [AllowAny()]
        if self.action in {'create', 'update', 'partial_update', 'destroy'}:
            return [IsTeacherOrAdmin()]
        return [IsAuthenticated()]
