from django.contrib import admin
from .models import Producto, EntradaStock


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'sku', 'precio', 'cantidad_disponible', 'cantidad_minima', 'activo')
    list_filter = ('activo', 'created_at')
    search_fields = ('nombre', 'sku')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Información', {
            'fields': ('nombre', 'sku', 'precio', 'descripcion')
        }),
        ('Inventario', {
            'fields': ('cantidad_disponible', 'cantidad_minima')
        }),
        ('Estado', {
            'fields': ('activo', 'created_at', 'updated_at')
        }),
    )


@admin.register(EntradaStock)
class EntradaStockAdmin(admin.ModelAdmin):
    list_display = ('producto', 'cantidad', 'motivo', 'usuario', 'created_at')
    list_filter = ('motivo', 'created_at', 'producto')
    search_fields = ('producto__nombre', 'usuario__email')
    readonly_fields = ('usuario', 'created_at', 'updated_at')
    fieldsets = (
        ('Producto', {
            'fields': ('producto',)
        }),
        ('Detalles', {
            'fields': ('cantidad', 'motivo', 'descripcion')
        }),
        ('Registro', {
            'fields': ('usuario', 'created_at', 'updated_at')
        }),
    )

