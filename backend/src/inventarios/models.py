from django.db import models


class InventarioProducto(models.Model):
    sku = models.CharField(max_length=32, unique=True)
    nombre = models.CharField(max_length=120)
    categoria = models.CharField(max_length=80)
    stock_actual = models.PositiveIntegerField(default=0)
    stock_minimo = models.PositiveIntegerField(default=10)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["categoria", "nombre"]

    def __str__(self):
        return f"{self.sku} - {self.nombre}"

    @property
    def estado(self):
        if self.stock_actual == 0:
            return "sin_stock"
        if self.stock_actual <= self.stock_minimo:
            return "stock_bajo"
        return "disponible"

    @property
    def estado_label(self):
        labels = {
            "disponible": "Disponible",
            "stock_bajo": "Stock bajo",
            "sin_stock": "Sin stock",
        }
        return labels[self.estado]
