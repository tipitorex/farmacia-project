from rest_framework import serializers
from .models import Producto, EntradaStock


class ProductoSerializer(serializers.ModelSerializer):
    """Serializer para Producto."""
    
    class Meta:
        model = Producto
        fields = [
            'id', 'nombre', 'sku', 'descripcion', 'precio',
            'cantidad_disponible', 'cantidad_minima', 'activo',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'cantidad_disponible']


class EntradaStockSerializer(serializers.ModelSerializer):
    """Serializer para crear entradas de stock."""
    
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    usuario_nombre = serializers.CharField(source='usuario.get_full_name', read_only=True)
    motivo_display = serializers.CharField(source='get_motivo_display', read_only=True)

    class Meta:
        model = EntradaStock
        fields = [
            'id', 'producto', 'producto_nombre', 'cantidad', 'motivo',
            'motivo_display', 'descripcion', 'usuario', 'usuario_nombre',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'usuario', 'created_at', 'updated_at', 'usuario_nombre']

    def validate_cantidad(self, value):
        """Validar que la cantidad sea positiva."""
        if value <= 0:
            raise serializers.ValidationError("La cantidad debe ser mayor a 0.")
        return value

    def validate(self, data):
        """Validar datos de entrada."""
        if not data.get('producto'):
            raise serializers.ValidationError("El producto es requerido.")
        if not data.get('motivo'):
            raise serializers.ValidationError("El motivo es requerido.")
        return data
