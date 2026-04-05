from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator

User = get_user_model()


class Producto(models.Model):
    """Modelo para productos en el inventario."""
    
    nombre = models.CharField(max_length=255, unique=True)
    sku = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    cantidad_disponible = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    cantidad_minima = models.IntegerField(default=10, validators=[MinValueValidator(0)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    activo = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Producto'
        verbose_name_plural = 'Productos'

    def __str__(self):
        return f"{self.nombre} ({self.sku})"


class EntradaStock(models.Model):
    """Modelo para registrar entradas de stock."""
    
    MOTIVOS_CHOICES = [
        ('reposicion', 'Reposición Proveedor'),
        ('devolucion', 'Devolución de Cliente'),
        ('ajuste', 'Ajuste de Inventario'),
        ('correccion', 'Corrección de Conteo'),
        ('otro', 'Otro'),
    ]

    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='entradas')
    cantidad = models.IntegerField(validators=[MinValueValidator(1)])
    motivo = models.CharField(max_length=20, choices=MOTIVOS_CHOICES)
    descripcion = models.TextField(blank=True, null=True)
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Entrada de Stock'
        verbose_name_plural = 'Entradas de Stock'

    def __str__(self):
        return f"{self.producto.nombre} - {self.cantidad} unidades ({self.motivo})"

    def save(self, *args, **kwargs):
        """Actualizar cantidad disponible del producto al guardar entrada."""
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new:
            self.producto.cantidad_disponible += self.cantidad
            self.producto.save(update_fields=['cantidad_disponible'])
