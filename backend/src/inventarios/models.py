from django.db import models

class MedicamentoGenerico(models.Model):
    nombre_generico = models.CharField(max_length=255, unique=True) # unique=True evita duplicados exactos
    concentracion = models.CharField(max_length=100) # ej: 500 mg
    forma_farmaceutica = models.CharField(max_length=100) # ej: Tableta, Jarabe
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.nombre_generico} {self.concentracion} - {self.forma_farmaceutica}"

class MedicamentoComercial(models.Model):
    nombre_comercial = models.CharField(max_length=255)
    laboratorio = models.CharField(max_length=255)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)
    fecha_vencimiento = models.DateField(blank=True, null=True)
    
    generico = models.ForeignKey(MedicamentoGenerico, on_delete=models.CASCADE, related_name='marcas')

    def __str__(self):
        return f"{self.nombre_comercial} ({self.laboratorio})"