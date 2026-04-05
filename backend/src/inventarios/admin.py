from django.contrib import admin

from .models import InventarioProducto


@admin.register(InventarioProducto)
class InventarioProductoAdmin(admin.ModelAdmin):
    list_display = ("sku", "nombre", "categoria", "stock_actual", "stock_minimo", "updated_at")
    search_fields = ("sku", "nombre", "categoria")
    list_filter = ("categoria",)
