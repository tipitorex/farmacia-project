from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django.contrib.auth.models import update_last_login
from django.contrib.auth.tokens import default_token_generator
from django.db.models import Q
from django.conf import settings
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    AdminUserCreateSerializer,
    AdminUserSerializer,
    AdminUserUpdateSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    UserSerializer,
)
from .audit import log_auth_event
from .security import (
    clear_failures_and_lock,
    consume_rate_limit,
    get_client_ip,
    is_locked,
    register_failure,
)


class AdminUsersPagination(PageNumberPagination):
    page_size = 8
    page_size_query_param = "page_size"
    max_page_size = 50


def set_auth_cookies(response, access_token=None, refresh_token=None):
    cookie_common_kwargs = {
        "httponly": True,
        "secure": settings.AUTH_COOKIE_SECURE,
        "samesite": settings.AUTH_COOKIE_SAMESITE,
        "path": "/",
    }

    if access_token:
        response.set_cookie(
            settings.AUTH_ACCESS_COOKIE_NAME,
            access_token,
            max_age=settings.AUTH_ACCESS_COOKIE_AGE,
            **cookie_common_kwargs,
        )

    if refresh_token:
        response.set_cookie(
            settings.AUTH_REFRESH_COOKIE_NAME,
            refresh_token,
            max_age=settings.AUTH_REFRESH_COOKIE_AGE,
            **cookie_common_kwargs,
        )


def clear_auth_cookies(response):
    response.delete_cookie(settings.AUTH_ACCESS_COOKIE_NAME, path="/")
    response.delete_cookie(settings.AUTH_REFRESH_COOKIE_NAME, path="/")


def auth_throttled_response():
    return Response(
        {"detail": "Demasiadas solicitudes. Intenta nuevamente en unos minutos."},
        status=status.HTTP_429_TOO_MANY_REQUESTS,
    )


def login_locked_response():
    return Response(
        {"detail": "Demasiados intentos de inicio de sesion. Espera unos minutos e intenta nuevamente."},
        status=status.HTTP_429_TOO_MANY_REQUESTS,
    )


def health(request):
    return JsonResponse({"status": "ok", "service": "backend"})


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    client_ip = get_client_ip(request)
    allowed = consume_rate_limit(
        scope="register",
        identifier=client_ip,
        limit=settings.AUTH_REGISTER_MAX_REQUESTS_PER_IP,
        window_seconds=settings.AUTH_RATE_LIMIT_WINDOW_SEC,
    )
    if not allowed:
        return auth_throttled_response()

    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()

    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    verify_url = f"{settings.FRONTEND_VERIFY_EMAIL_URL}?uid={uid}&token={token}"

    send_mail(
        subject="Verifica tu correo - Farmacia SaludPlus",
        message=(
            "Gracias por registrarte en Farmacia SaludPlus.\n\n"
            f"Confirma tu cuenta en el siguiente enlace: {verify_url}\n\n"
            "Si no creaste esta cuenta, ignora este mensaje."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=True,
    )

    log_auth_event(request, "register", outcome="success", email=user.email)

    return Response(
        {
            "detail": "Registro completado. Revisa tu correo para activar tu cuenta.",
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get("email", "")
    password = request.data.get("password", "")
    normalized_email = email.strip().lower()
    client_ip = get_client_ip(request)

    ip_allowed = consume_rate_limit(
        scope="login",
        identifier=client_ip,
        limit=settings.AUTH_LOGIN_MAX_REQUESTS_PER_IP,
        window_seconds=settings.AUTH_RATE_LIMIT_WINDOW_SEC,
    )
    if not ip_allowed:
        return auth_throttled_response()

    ip_scope = "login-ip"
    email_scope = "login-email"

    if is_locked(ip_scope, client_ip) or (normalized_email and is_locked(email_scope, normalized_email)):
        log_auth_event(request, "login", outcome="locked", email=normalized_email)
        return login_locked_response()

    user_model = get_user_model()
    user = user_model.objects.filter(email__iexact=normalized_email).first()

    if not user or not user.is_active or not user.check_password(password):
        register_failure(
            scope=ip_scope,
            identifier=client_ip,
            threshold=settings.AUTH_LOGIN_LOCK_THRESHOLD,
            base_lock_seconds=settings.AUTH_LOGIN_LOCK_BASE_SEC,
            max_lock_seconds=settings.AUTH_LOGIN_LOCK_MAX_SEC,
            failure_ttl_seconds=settings.AUTH_LOGIN_FAILURE_TTL_SEC,
        )

        if normalized_email:
            register_failure(
                scope=email_scope,
                identifier=normalized_email,
                threshold=settings.AUTH_LOGIN_LOCK_THRESHOLD,
                base_lock_seconds=settings.AUTH_LOGIN_LOCK_BASE_SEC,
                max_lock_seconds=settings.AUTH_LOGIN_LOCK_MAX_SEC,
                failure_ttl_seconds=settings.AUTH_LOGIN_FAILURE_TTL_SEC,
            )

        log_auth_event(request, "login", outcome="failure", email=normalized_email)
        return Response(
            {"detail": "Credenciales invalidas."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    clear_failures_and_lock(ip_scope, client_ip)
    if normalized_email:
        clear_failures_and_lock(email_scope, normalized_email)

    update_last_login(None, user)
    log_auth_event(request, "login", outcome="success", user_id=user.id, email=user.email)

    refresh = RefreshToken.for_user(user)
    response = Response(
        {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data,
        }
    )
    set_auth_cookies(response, access_token=str(refresh.access_token), refresh_token=str(refresh))
    return response


@api_view(["POST"])
@permission_classes([AllowAny])
def refresh_session(request):
    refresh_token = request.COOKIES.get(settings.AUTH_REFRESH_COOKIE_NAME) or request.data.get("refresh")
    if not refresh_token:
        log_auth_event(request, "refresh", outcome="failure", reason="missing-refresh-token")
        return Response({"detail": "Sesion no disponible para renovar."}, status=status.HTTP_401_UNAUTHORIZED)

    serializer = TokenRefreshSerializer(data={"refresh": refresh_token})
    serializer.is_valid(raise_exception=True)

    access_token = serializer.validated_data.get("access")
    rotated_refresh_token = serializer.validated_data.get("refresh")

    response = Response(
        {
            "access": access_token,
            "refresh": rotated_refresh_token,
        }
    )
    set_auth_cookies(response, access_token=access_token, refresh_token=rotated_refresh_token)
    log_auth_event(request, "refresh", outcome="success")
    return response


@api_view(["POST"])
@permission_classes([AllowAny])
def logout(request):
    response = Response({"detail": "Sesion cerrada correctamente."}, status=status.HTTP_200_OK)
    clear_auth_cookies(response)
    log_auth_event(request, "logout", outcome="success")
    return response


@api_view(["POST"])
@permission_classes([AllowAny])
def verify_email(request):
    uid = request.data.get("uid", "")
    token = request.data.get("token", "")

    if not uid or not token:
        return Response({"detail": "Enlace de verificacion invalido."}, status=status.HTTP_400_BAD_REQUEST)

    user_model = get_user_model()
    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = user_model.objects.get(pk=user_id)
    except (TypeError, ValueError, OverflowError, user_model.DoesNotExist):
        log_auth_event(request, "verify-email", outcome="failure", reason="invalid-uid")
        return Response({"detail": "Enlace de verificacion invalido."}, status=status.HTTP_400_BAD_REQUEST)

    if not default_token_generator.check_token(user, token):
        log_auth_event(request, "verify-email", outcome="failure", user_id=user.id, reason="invalid-token")
        return Response({"detail": "El enlace de verificacion ha expirado o no es valido."}, status=status.HTTP_400_BAD_REQUEST)

    if not user.is_active:
        user.is_active = True
        user.save(update_fields=["is_active"])

    log_auth_event(request, "verify-email", outcome="success", user_id=user.id, email=user.email)
    return Response({"detail": "Correo verificado correctamente. Ya puedes iniciar sesion."}, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(UserSerializer(request.user).data)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def admin_users_list(request):
    if request.method == "GET":
        if not (request.user.is_staff or request.user.is_superuser):
            return Response({"detail": "No tienes permisos para ver usuarios."}, status=status.HTTP_403_FORBIDDEN)

        user_model = get_user_model()
        users = user_model.objects.all().order_by("-date_joined")

        search = request.query_params.get("search", "").strip()
        role = request.query_params.get("role", "all").strip().lower()
        status_filter = request.query_params.get("status", "all").strip().lower()

        if search:
            users = users.filter(
                Q(username__icontains=search)
                | Q(email__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
            )

        if role == "admin":
            users = users.filter(is_superuser=True)
        elif role == "worker":
            users = users.filter(is_staff=True, is_superuser=False)
        elif role == "customer":
            users = users.filter(is_staff=False, is_superuser=False)

        if status_filter == "active":
            users = users.filter(is_active=True)
        elif status_filter == "inactive":
            users = users.filter(is_active=False)

        paginator = AdminUsersPagination()
        paged_users = paginator.paginate_queryset(users, request)
        serializer = AdminUserSerializer(paged_users, many=True)
        return paginator.get_paginated_response(serializer.data)

    if not request.user.is_superuser:
        return Response(
            {"detail": "Solo administradores pueden crear usuarios desde el panel."},
            status=status.HTTP_403_FORBIDDEN,
        )

    serializer = AdminUserCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    created_user = serializer.save()
    return Response(AdminUserSerializer(created_user).data, status=status.HTTP_201_CREATED)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def admin_user_update(request, user_id):
    if not request.user.is_superuser:
        return Response(
            {"detail": "Solo administradores pueden editar roles y estado de usuarios."},
            status=status.HTTP_403_FORBIDDEN,
        )

    user_model = get_user_model()
    try:
        target_user = user_model.objects.get(id=user_id)
    except user_model.DoesNotExist:
        return Response({"detail": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)

    serializer = AdminUserUpdateSerializer(
        target_user,
        data=request.data,
        partial=True,
        context={"request_user": request.user},
    )
    serializer.is_valid(raise_exception=True)
    updated_user = serializer.save()

    return Response(AdminUserSerializer(updated_user).data)


@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_request(request):
    client_ip = get_client_ip(request)
    allowed = consume_rate_limit(
        scope="password-reset-request",
        identifier=client_ip,
        limit=settings.AUTH_RESET_MAX_REQUESTS_PER_IP,
        window_seconds=settings.AUTH_RATE_LIMIT_WINDOW_SEC,
    )
    if not allowed:
        return auth_throttled_response()

    serializer = PasswordResetRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data["email"]
    user_model = get_user_model()
    user = user_model.objects.filter(email__iexact=email, is_active=True).first()

    if user:
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_url = f"{settings.FRONTEND_RESET_PASSWORD_URL}?uid={uid}&token={token}"

        send_mail(
            subject="Recuperacion de contrasena - Farmacia SaludPlus",
            message=(
                "Recibimos una solicitud para restablecer tu contrasena.\n\n"
                f"Ingresa al siguiente enlace: {reset_url}\n\n"
                "Si no solicitaste este cambio, ignora este mensaje."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )

    log_auth_event(request, "password-reset-request", outcome="accepted", email=email)

    return Response(
        {
            "detail": "Si el correo existe, te enviaremos un enlace para restablecer tu contrasena.",
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    serializer = PasswordResetConfirmSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    uid = serializer.validated_data["uid"]
    token = serializer.validated_data["token"]
    password = serializer.validated_data["password"]

    user_model = get_user_model()
    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = user_model.objects.get(pk=user_id)
    except (TypeError, ValueError, OverflowError, user_model.DoesNotExist):
        log_auth_event(request, "password-reset-confirm", outcome="failure", reason="invalid-uid")
        return Response({"detail": "Enlace de recuperacion invalido."}, status=status.HTTP_400_BAD_REQUEST)

    if not default_token_generator.check_token(user, token):
        log_auth_event(request, "password-reset-confirm", outcome="failure", user_id=user.id, reason="invalid-token")
        return Response({"detail": "El enlace ha expirado o no es valido."}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(password)
    user.save(update_fields=["password"])
    log_auth_event(request, "password-reset-confirm", outcome="success", user_id=user.id)

    return Response({"detail": "Contrasena actualizada correctamente."}, status=status.HTTP_200_OK)
