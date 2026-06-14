from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin
from django.urls import path
from django.shortcuts import redirect
from django.template.response import TemplateResponse
from django.utils.translation import gettext_lazy as _

from .models import CustomUser
from .models import Teacher
from subjects.models import Subject
from django import forms
from django.contrib.admin.widgets import FilteredSelectMultiple


class SubjectInline(admin.TabularInline):
    model = Subject
    fk_name = 'teacher'
    extra = 0
    fields = ('name', 'code', 'duration_months', 'monthly_price', 'is_active')


class TeacherForm(forms.ModelForm):
    subjects = forms.ModelMultipleChoiceField(
        queryset=Subject.objects.all(),
        required=False,
        help_text='Select existing subjects this teacher will teach (assigns Subject.teacher).',
        widget=FilteredSelectMultiple('Subjects', is_stacked=False),
    )

    class Meta:
        model = Teacher
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk:
            self.fields['subjects'].initial = self.instance.subjects_taught.all()


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    change_list_template = 'admin/accounts/customuser/change_list.html'

    fieldsets = UserAdmin.fieldsets + (
        ('Platform info', {'fields': ('role', 'phone', 'photo')}),
    )
    list_display = ('username', 'first_name', 'last_name', 'role', 'is_staff')
    actions = ['delete_non_admins_action']

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('delete-non-admins/', self.admin_site.admin_view(self.delete_non_admins_view), name='accounts_customuser_delete_non_admins'),
        ]
        return custom_urls + urls

    def delete_non_admins_action(self, request, queryset):
        """Admin action: delete selected users OR all non-admins when no selection."""
        # If called as an action with selection, delete those non-admin users
        to_delete = queryset.exclude(role='admin')
        count = to_delete.count()
        to_delete.delete()
        self.message_user(request, _('%d user(s) deleted (non-admin selection)') % count, level=messages.SUCCESS)

    delete_non_admins_action.short_description = 'Delete selected users (excluding admins)'

    def delete_non_admins_view(self, request):
        """Custom admin view to delete all non-admin users after confirmation."""
        if request.method == 'POST':
            # Perform deletion
            qs = CustomUser.objects.exclude(role='admin')
            count = qs.count()
            qs.delete()
            self.message_user(request, _('%d user(s) deleted (all non-admins)') % count, level=messages.SUCCESS)
            return redirect('..')

        context = dict(
            self.admin_site.each_context(request),
            title=_('Are you sure? Deleting all non-admin users'),
        )
        return TemplateResponse(request, 'admin/accounts/customuser/confirm_delete_non_admins.html', context)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # Exclude teachers from the main users list to keep a separate Teachers section
        return qs.exclude(role='teacher')

@admin.register(Teacher)
class TeacherAdmin(UserAdmin):
    """Separate admin view for teachers so admins can manage them in one place."""
    fieldsets = UserAdmin.fieldsets + (
        ('Platform info', {'fields': ('role', 'phone', 'photo')}),
    )
    list_display = ('username', 'first_name', 'last_name', 'role', 'is_staff')
    list_filter = ('role', 'is_staff')
    # use a multi-select widget to choose existing subjects instead of inline add
    form = TeacherForm
    list_display = ('username', 'first_name', 'last_name', 'role', 'is_staff', 'list_subjects')
    inlines = []
    fieldsets = UserAdmin.fieldsets + (
        ('Platform info', {'fields': ('role', 'phone', 'photo')}),
        ('Subjects', {'fields': ('subjects',)}),
    )

    def list_subjects(self, obj):
        return ', '.join([s.name for s in obj.subjects_taught.all()])

    list_subjects.short_description = 'Subjects'

    def save_model(self, request, obj, form, change):
        # Ensure teacher accounts have role set and are staff users to access admin/dashboard
        obj.role = 'teacher'
        obj.is_staff = True
        super().save_model(request, obj, form, change)

        # Update Subject.teacher assignments based on selected subjects field
        try:
            selected = form.cleaned_data.get('subjects', None)
        except Exception:
            selected = None

        if selected is not None:
            # Unassign subjects previously assigned to this teacher but not selected
            Subject.objects.filter(teacher=obj).exclude(pk__in=[s.pk for s in selected]).update(teacher=None)
            # Assign selected subjects to this teacher
            Subject.objects.filter(pk__in=[s.pk for s in selected]).update(teacher=obj)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # Only show users with the teacher role in this proxy admin
        return qs.filter(role='teacher')
