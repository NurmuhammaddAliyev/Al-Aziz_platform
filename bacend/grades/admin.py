from django.contrib import admin

from .models import Grade


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'subject', 'score', 'scale', 'date', 'created_by')
    list_filter = ('scale', 'date', 'subject')
    search_fields = ('student__user__username', 'student__user__first_name', 'student__user__last_name', 'subject__name')
