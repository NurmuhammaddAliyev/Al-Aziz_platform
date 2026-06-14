from rest_framework.routers import DefaultRouter

from .views import ClassGroupViewSet


router = DefaultRouter()
router.register(r'', ClassGroupViewSet, basename='class-groups')

urlpatterns = router.urls
