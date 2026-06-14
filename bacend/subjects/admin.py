from django.contrib import admin

from .models import Subject


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'code', 'teacher', 'duration_months', 'monthly_price', 'is_active')
    search_fields = ('name', 'code')
