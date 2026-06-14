from django.db.models.signals import post_save
from django.dispatch import receiver

from accounts.models import CustomUser

from .models import StudentProfile


@receiver(post_save, sender=CustomUser)
def create_student_profile(sender, instance, created, **kwargs):
    if instance.role != CustomUser.Role.STUDENT:
        return
    StudentProfile.objects.get_or_create(user=instance)

