from django.urls import path

from .views import health, login, me, register

urlpatterns = [
    path("health/", health, name="health"),
    path("auth/register/", register, name="register"),
    path("auth/login/", login, name="login"),
    path("auth/me/", me, name="me"),
]
