from django.contrib import admin

from .models import ClassGroup, CourseEnrollment, StudentProfile


@admin.register(ClassGroup)
class ClassGroupAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'class_group', 'class_name', 'phone')
    list_filter = ('class_group', 'is_active')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'class_name', 'class_group__name')


@admin.register(CourseEnrollment)
class CourseEnrollmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'phone', 'subject', 'status')
    list_filter = ('status', 'subject')
    search_fields = ('student__user__username', 'student__user__first_name', 'student__user__last_name', 'subject__name')
