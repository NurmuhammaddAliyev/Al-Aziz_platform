from django.urls import path

from .views import MeAPIView, RegisterAPIView


urlpatterns = [
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('me/', MeAPIView.as_view(), name='me'),
]
