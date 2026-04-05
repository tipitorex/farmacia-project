#!/usr/bin/env python
from inventarios.models import Producto

# Crear algunos productos de prueba
productos = [
    {'nombre': 'Paracetamol 500mg', 'sku': 'PARA-500', 'precio': 5.50, 'cantidad_minima': 20},
    {'nombre': 'Ibuprofeno 400mg', 'sku': 'IBUP-400', 'precio': 8.75, 'cantidad_minima': 15},
    {'nombre': 'Amoxicilina 500mg', 'sku': 'AMOX-500', 'precio': 12.00, 'cantidad_minima': 10},
    {'nombre': 'Vitamina C 1000mg', 'sku': 'VITC-1000', 'precio': 3.50, 'cantidad_minima': 30},
]

for prod in productos:
    Producto.objects.get_or_create(
        nombre=prod['nombre'],
        defaults={
            'sku': prod['sku'],
            'precio': prod['precio'],
            'cantidad_minima': prod['cantidad_minima'],
            'cantidad_disponible': 0,
        }
    )
    print(f"✓ {prod['nombre']}")
