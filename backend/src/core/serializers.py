from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .rbac import (
    ROLE_ADMIN,
    ROLE_CLIENTE,
    PERMISOS_CATALOGO,
    asignar_rol_usuario,
    normalizar_nombre_rol,
    obtener_catalogo_permisos,
    obtener_permisos_rol,
    obtener_roles_disponibles,
    obtener_permisos_usuario,
    obtener_rol_usuario,
    puede_acceder_backoffice,
)


def _generate_unique_username(email):
    user_model = get_user_model()
    base = (email.split("@")[0] or "usuario").strip().replace(" ", "")[:120] or "usuario"
    candidate = base
    index = 1
    while user_model.objects.filter(username=candidate).exists():
        candidate = f"{base}{index}"
        index += 1
    return candidate


class RegisterSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(required=True, max_length=150)
    last_name = serializers.CharField(required=True, max_length=150)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = get_user_model()
        fields = ("first_name", "last_name", "email", "password")

    def validate_email(self, value):
        user_model = get_user_model()
        normalized = value.strip().lower()
        if user_model.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError("Este correo ya esta registrado.")
        return normalized

    def create(self, validated_data):
        user_model = get_user_model()
        validated_data["username"] = _generate_unique_username(validated_data["email"])
        user = user_model.objects.create_user(**validated_data)
        user.is_active = False
        user.save(update_fields=["is_active"])
        return user


class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    can_access_admin = serializers.SerializerMethodField()
    permisos = serializers.SerializerMethodField()

    class Meta:
        model = get_user_model()
        fields = ("id", "username", "first_name", "last_name", "email", "role", "can_access_admin", "permisos")

    def get_role(self, obj):
        return obtener_rol_usuario(obj)

    def get_can_access_admin(self, obj):
        return puede_acceder_backoffice(obj)

    def get_permisos(self, obj):
        return obtener_permisos_usuario(obj)


class AdminUserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    can_access_admin = serializers.SerializerMethodField()
    permisos = serializers.SerializerMethodField()

    class Meta:
        model = get_user_model()
        fields = (
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "role",
            "can_access_admin",
            "permisos",
            "is_active",
            "is_staff",
            "is_superuser",
            "date_joined",
            "last_login",
        )

    def get_role(self, obj):
        return obtener_rol_usuario(obj)

    def get_can_access_admin(self, obj):
        return puede_acceder_backoffice(obj)

    def get_permisos(self, obj):
        return obtener_permisos_usuario(obj)


class AdminUserUpdateSerializer(serializers.Serializer):
    role = serializers.CharField(required=False)
    is_active = serializers.BooleanField(required=False)

    def validate_role(self, value):
        role = normalizar_nombre_rol(value)
        if role not in set(obtener_roles_disponibles()):
            raise serializers.ValidationError("El rol indicado no existe.")
        return role

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError("Debes enviar al menos un campo para actualizar.")

        request_user = self.context.get("request_user")
        target_user = self.instance

        if request_user and target_user and request_user.id == target_user.id:
            next_role = attrs.get("role")
            next_active = attrs.get("is_active")

            if next_active is False:
                raise serializers.ValidationError("No puedes desactivar tu propia cuenta.")

            if next_role and next_role != "admin":
                raise serializers.ValidationError("No puedes quitarte el rol de administrador a ti mismo.")

        return attrs

    def update(self, instance, validated_data):
        role = validated_data.get("role")
        if role:
            asignar_rol_usuario(instance, role)

        if "is_active" in validated_data:
            instance.is_active = validated_data["is_active"]

        instance.save(update_fields=["is_superuser", "is_staff", "is_active"])
        return instance


class AdminUserCreateSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.CharField(default=ROLE_CLIENTE)
    is_active = serializers.BooleanField(default=True)

    def validate_role(self, value):
        role = normalizar_nombre_rol(value)
        if role not in set(obtener_roles_disponibles()):
            raise serializers.ValidationError("El rol indicado no existe.")
        return role

    def validate_email(self, value):
        user_model = get_user_model()
        normalized = value.strip().lower()
        if user_model.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError("Este correo ya esta registrado.")
        return normalized

    def create(self, validated_data):
        user_model = get_user_model()
        role = validated_data.pop("role", ROLE_CLIENTE)
        is_active = validated_data.pop("is_active", True)

        validated_data["username"] = _generate_unique_username(validated_data["email"])

        user = user_model.objects.create_user(**validated_data)
        user.is_active = is_active

        asignar_rol_usuario(user, role)

        user.save(update_fields=["is_active", "is_superuser", "is_staff"])
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class RolSerializer(serializers.Serializer):
    nombre = serializers.CharField()
    permisos = serializers.ListField(child=serializers.CharField(), required=False)

    def to_representation(self, instance):
        return {
            "nombre": instance if isinstance(instance, str) else instance.name,
            "permisos": obtener_permisos_rol(instance if isinstance(instance, str) else instance.name),
        }


class RolCreateUpdateSerializer(serializers.Serializer):
    nombre = serializers.CharField(required=True)
    permisos = serializers.ListField(child=serializers.CharField(), required=False, default=list)

    def validate_nombre(self, value):
        return normalizar_nombre_rol(value)

    def validate_permisos(self, value):
        catalog = set(obtener_catalogo_permisos())
        invalid = [code for code in value if code not in catalog]
        if invalid:
            raise serializers.ValidationError(f"Permisos invalidos: {', '.join(invalid)}")
        return sorted(set(value))


class PermisoCatalogoSerializer(serializers.Serializer):
    codigo = serializers.CharField()
    nombre = serializers.CharField()

    def to_representation(self, instance):
        return {
            "codigo": instance,
            "nombre": PERMISOS_CATALOGO.get(instance, instance),
        }


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True, min_length=6)

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Las contrasenas no coinciden."})

        validate_password(attrs["password"])
        return attrs
