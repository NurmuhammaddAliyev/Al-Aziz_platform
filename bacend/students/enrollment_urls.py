from rest_framework.routers import DefaultRouter
from .views import CourseEnrollmentViewSet

router = DefaultRouter()
router.register(r'', CourseEnrollmentViewSet, basename='course-enrollments')

urlpatterns = router.urls
