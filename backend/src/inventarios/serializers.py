from rest_framework import serializers
from .models import (
    Categoria,
    Subcategoria,
    Laboratorio,
    Producto,
    Inventario,
    MovimientoInventario,
    EntradaStock,
)


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ["id", "nombre", "descripcion", "estado", "created_at", "updated_at"]
        read_only_fields = ["created_at", "updated_at"]


class SubcategoriaSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.ReadOnlyField(source="categoria.nombre")

    class Meta:
        model = Subcategoria
        fields = ["id", "categoria", "categoria_nombre", "nombre", "descripcion", "estado", "created_at", "updated_at"]
        read_only_fields = ["created_at", "updated_at"]


class LaboratorioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Laboratorio
        fields = [
            "id", "nombre", "pais", "telefono", "email", "direccion",
            "contacto_representante", "estado", "created_at", "updated_at"
        ]
        read_only_fields = ["created_at", "updated_at"]


class InventarioSerializer(serializers.ModelSerializer):
    stock_disponible = serializers.ReadOnlyField()
    necesita_reabastecimiento = serializers.ReadOnlyField()

    class Meta:
        model = Inventario
        fields = [
            "id", "stock_actual", "stock_reservado", "stock_disponible",
            "stock_minimo", "necesita_reabastecimiento", "ultima_entrada_fecha",
            "ultima_salida_fecha", "updated_at"
        ]
        read_only_fields = ["ultima_entrada_fecha", "ultima_salida_fecha", "updated_at"]


class ProductoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.ReadOnlyField(source="categoria.nombre")
    laboratorio_nombre = serializers.ReadOnlyField(source="laboratorio.nombre")
    subcategoria_nombre = serializers.ReadOnlyField(source="subcategoria.nombre", allow_null=True)

    categoria_id = serializers.PrimaryKeyRelatedField(source="categoria", queryset=Categoria.objects.all(), write_only=True)
    laboratorio_id = serializers.PrimaryKeyRelatedField(source="laboratorio", queryset=Laboratorio.objects.all(), write_only=True)
    subcategoria_id = serializers.PrimaryKeyRelatedField(source="subcategoria", queryset=Subcategoria.objects.all(), required=False, allow_null=True, write_only=True)

    inventario = InventarioSerializer(read_only=True)

    class Meta:
        model = Producto
        fields = [
            "id", "sku", "nombre_comercial", "nombre_generico", "descripcion",
            "categoria", "categoria_nombre", "categoria_id",
            "subcategoria", "subcategoria_nombre", "subcategoria_id",
            "laboratorio", "laboratorio_nombre", "laboratorio_id",
            "forma_farmaceutica", "concentracion", "presentacion", "unidad_medida",
            "precio_compra", "precio_venta", "stock_minimo",
            "requiere_receta", "es_controlado", "estado",
            "inventario", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "created_at", "updated_at", "categoria", "laboratorio", "subcategoria"]


class MovimientoInventarioSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.ReadOnlyField(source="producto.nombre_comercial")
    producto_sku = serializers.ReadOnlyField(source="producto.sku")
    usuario_nombre = serializers.ReadOnlyField(source="usuario.get_full_name")

    class Meta:
        model = MovimientoInventario
        fields = [
            "id", "producto", "producto_nombre", "producto_sku",
            "tipo_movimiento", "cantidad", "motivo", "referencia",
            "usuario", "usuario_nombre", "fecha_movimiento", "observacion", "created_at"
        ]
        read_only_fields = ["id", "fecha_movimiento", "created_at"]


class EntradaStockSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.ReadOnlyField(source="producto.nombre_comercial")
    producto_sku = serializers.ReadOnlyField(source="producto.sku")
    usuario_nombre = serializers.ReadOnlyField(source="usuario.get_full_name")
    motivo_display = serializers.CharField(source="get_motivo_display", read_only=True)

    class Meta:
        model = EntradaStock
        fields = [
            "id", "producto", "producto_nombre", "producto_sku", "cantidad", "motivo",
            "motivo_display", "descripcion", "usuario", "usuario_nombre", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "usuario", "created_at", "updated_at", "usuario_nombre"]

    def validate_cantidad(self, value):
        if value <= 0:
            raise serializers.ValidationError("La cantidad debe ser mayor a 0.")
        return value
