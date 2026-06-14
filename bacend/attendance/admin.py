from django.contrib import admin

from .models import Attendance


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'date', 'status', 'recorded_by', 'created_at')
    list_filter = ('status', 'date')
    search_fields = ('student__user__username', 'student__user__first_name', 'student__user__last_name')
