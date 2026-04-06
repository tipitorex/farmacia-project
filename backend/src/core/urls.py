from django.urls import path

# Agregamos 'admin_medicamento_detalle' a la lista de importación
from .views import (
    admin_permisos_catalogo,
    admin_role_detail,
    admin_roles_list,
    admin_user_update,
    admin_users_list,
    health,
    login,
    logout,
    me,
    password_reset_confirm,
    password_reset_request,
    refresh_session,
    register,
    verify_email,
    admin_medicamentos_list,
    admin_medicamento_detalle, # <--- IMPORTANTE: Agrégala aquí
)

urlpatterns = [
    path("health/", health, name="health"),
    path("auth/register/", register, name="register"),
    path("auth/verify-email/", verify_email, name="verify-email"),
    path("auth/login/", login, name="login"),
    path("auth/refresh/", refresh_session, name="refresh-session"),
    path("auth/logout/", logout, name="logout"),
    path("auth/me/", me, name="me"),
    path("auth/password-reset/request/", password_reset_request, name="password-reset-request"),
    path("auth/password-reset/confirm/", password_reset_confirm, name="password-reset-confirm"),
    path("admin/users/", admin_users_list, name="admin-users-list"),
    path("admin/users/<int:user_id>/", admin_user_update, name="admin-user-update"),
    path("admin/roles/", admin_roles_list, name="admin-roles-list"),
    path("admin/roles/<str:role_name>/", admin_role_detail, name="admin-role-detail"),
    path("admin/permisos/", admin_permisos_catalogo, name="admin-permisos-catalogo"),
    path("admin/medicamentos/", admin_medicamentos_list, name="admin-medicamentos-list"),  
    path('admin/medicamentos/<int:pk>/', admin_medicamento_detalle, name="admin-medicamento-detalle"),
]