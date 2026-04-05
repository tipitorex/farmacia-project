from rest_framework import serializers

from .models import InventarioProducto


class InventarioProductoSerializer(serializers.ModelSerializer):
    estado = serializers.SerializerMethodField()
    estado_label = serializers.SerializerMethodField()

    class Meta:
        model = InventarioProducto
        fields = [
            "id",
            "sku",
            "nombre",
            "categoria",
            "stock_actual",
            "stock_minimo",
            "estado",
            "estado_label",
            "updated_at",
        ]

    def get_estado(self, obj):
        return obj.estado

    def get_estado_label(self, obj):
        return obj.estado_label
