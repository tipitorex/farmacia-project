from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers


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

    class Meta:
        model = get_user_model()
        fields = ("id", "username", "first_name", "last_name", "email", "role", "can_access_admin")

    def get_role(self, obj):
        if obj.is_superuser:
            return "admin"
        if obj.is_staff:
            return "worker"
        return "customer"

    def get_can_access_admin(self, obj):
        return bool(obj.is_staff or obj.is_superuser)


class AdminUserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    can_access_admin = serializers.SerializerMethodField()

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
            "is_active",
            "is_staff",
            "is_superuser",
            "date_joined",
            "last_login",
        )

    def get_role(self, obj):
        if obj.is_superuser:
            return "admin"
        if obj.is_staff:
            return "worker"
        return "customer"

    def get_can_access_admin(self, obj):
        return bool(obj.is_staff or obj.is_superuser)


class AdminUserUpdateSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=["admin", "worker", "customer"], required=False)
    is_active = serializers.BooleanField(required=False)

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
            if role == "admin":
                instance.is_superuser = True
                instance.is_staff = True
            elif role == "worker":
                instance.is_superuser = False
                instance.is_staff = True
            else:
                instance.is_superuser = False
                instance.is_staff = False

        if "is_active" in validated_data:
            instance.is_active = validated_data["is_active"]

        instance.save(update_fields=["is_superuser", "is_staff", "is_active"])
        return instance


class AdminUserCreateSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=["admin", "worker", "customer"], default="customer")
    is_active = serializers.BooleanField(default=True)

    def validate_email(self, value):
        user_model = get_user_model()
        normalized = value.strip().lower()
        if user_model.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError("Este correo ya esta registrado.")
        return normalized

    def create(self, validated_data):
        user_model = get_user_model()
        role = validated_data.pop("role", "customer")
        is_active = validated_data.pop("is_active", True)

        validated_data["username"] = _generate_unique_username(validated_data["email"])

        user = user_model.objects.create_user(**validated_data)
        user.is_active = is_active

        if role == "admin":
            user.is_superuser = True
            user.is_staff = True
        elif role == "worker":
            user.is_superuser = False
            user.is_staff = True
        else:
            user.is_superuser = False
            user.is_staff = False

        user.save(update_fields=["is_active", "is_superuser", "is_staff"])
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


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
