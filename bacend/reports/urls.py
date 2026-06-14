from django.urls import path

from .views import (
    AbsenceAlertAPIView,
    AttendanceExportAPIView,
    ClassSummaryAPIView,
    DashboardStatsAPIView,
    GradesExportAPIView,
)


urlpatterns = [
    path('dashboard/', DashboardStatsAPIView.as_view(), name='dashboard-stats'),
    path('class-summary/', ClassSummaryAPIView.as_view(), name='class-summary'),
    path('absence-alerts/', AbsenceAlertAPIView.as_view(), name='absence-alerts'),
    path('export/attendance/', AttendanceExportAPIView.as_view(), name='attendance-export'),
    path('export/grades/', GradesExportAPIView.as_view(), name='grades-export'),
]
