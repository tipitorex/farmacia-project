from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from inventarios.models import (
    Categoria, Subcategoria, Laboratorio, 
    Producto, Inventario, MovimientoInventario
)
from decimal import Decimal
from random import randint, choice

User = get_user_model()

class Command(BaseCommand):
    help = 'Pobla la base de datos con datos de ejemplo para pruebas'

    def handle(self, *args, **options):
        self.stdout.write('🌱 Sembrando datos de prueba...')
        
        # 1. Categorías y Subcategorías
        categorias_data = [
            {'nombre': 'Medicamentos', 'descripcion': 'Medicamentos de uso humano'},
            {'nombre': 'Cuidado Personal', 'descripcion': 'Productos de higiene y cosmética'},
            {'nombre': 'Suplementos', 'descripcion': 'Vitaminas y suplementos nutricionales'},
            {'nombre': 'Equipo Médico', 'descripcion': 'Equipos y dispositivos médicos'},
        ]
        
        categorias = {}
        for cat_data in categorias_data:
            cat, _ = Categoria.objects.get_or_create(
                nombre=cat_data['nombre'],
                defaults={'descripcion': cat_data['descripcion']}
            )
            categorias[cat.nombre] = cat
            self.stdout.write(f'  ✓ Categoría: {cat.nombre}')
        
        subcategorias_data = [
            ('Medicamentos', 'Analgésicos', 'Alivio del dolor'),
            ('Medicamentos', 'Antibióticos', 'Tratamiento de infecciones'),
            ('Medicamentos', 'Antiinflamatorios', 'Reducción de inflamación'),
            ('Cuidado Personal', 'Cuidado Bucal', 'Pastas dentales, enjuagues'),
            ('Cuidado Personal', 'Cuidado de la Piel', 'Cremas, protectores solares'),
            ('Suplementos', 'Vitaminas', 'Complejos vitamínicos'),
            ('Suplementos', 'Proteínas', 'Suplementos proteicos'),
        ]
        
        for cat_nombre, sub_nombre, sub_desc in subcategorias_data:
            cat = categorias.get(cat_nombre)
            if cat:
                sub, _ = Subcategoria.objects.get_or_create(
                    categoria=cat,
                    nombre=sub_nombre,
                    defaults={'descripcion': sub_desc}
                )
                self.stdout.write(f'  ✓ Subcategoría: {cat.nombre} - {sub.nombre}')
        
        # 2. Laboratorios
        laboratorios_data = [
            {'nombre': 'Bayer', 'pais': 'Alemania', 'telefono': '+49 123456789', 'email': 'contacto@bayer.de'},
            {'nombre': 'Pfizer', 'pais': 'EE.UU.', 'telefono': '+1 212 733 2323', 'email': 'info@pfizer.com'},
            {'nombre': 'Roche', 'pais': 'Suiza', 'telefono': '+41 61 688 1111', 'email': 'roche@roche.com'},
            {'nombre': 'Novartis', 'pais': 'Suiza', 'telefono': '+41 61 324 1111', 'email': 'novartis@novartis.com'},
            {'nombre': 'Sanofi', 'pais': 'Francia', 'telefono': '+33 1 53 77 40 00', 'email': 'contact@sanofi.com'},
        ]
        
        laboratorios = {}
        for lab_data in laboratorios_data:
            lab, _ = Laboratorio.objects.get_or_create(
                nombre=lab_data['nombre'],
                defaults={
                    'pais': lab_data['pais'],
                    'telefono': lab_data['telefono'],
                    'email': lab_data['email'],
                }
            )
            laboratorios[lab.nombre] = lab
            self.stdout.write(f'  ✓ Laboratorio: {lab.nombre}')
        
        # 3. Productos
        productos_data = [
            {
                'sku': 'PARA-001',
                'nombre_comercial': 'Paracetamol 500 mg',
                'nombre_generico': 'Paracetamol',
                'categoria': 'Medicamentos',
                'laboratorio': 'Bayer',
                'forma_farmaceutica': 'tableta',
                'concentracion': '500 mg',
                'presentacion': 'Caja x 20 tabletas',
                'unidad_medida': 'caja',
                'precio_compra': 5.50,
                'precio_venta': 12.90,
                'stock_minimo': 10,
                'requiere_receta': False,
                'es_controlado': False,
                'descripcion': 'Analgésico y antipirético.'
            },
            {
                'sku': 'IBU-002',
                'nombre_comercial': 'Ibuprofeno 600 mg',
                'nombre_generico': 'Ibuprofeno',
                'categoria': 'Medicamentos',
                'laboratorio': 'Pfizer',
                'forma_farmaceutica': 'tableta',
                'concentracion': '600 mg',
                'presentacion': 'Caja x 30 tabletas',
                'unidad_medida': 'caja',
                'precio_compra': 8.20,
                'precio_venta': 18.50,
                'stock_minimo': 15,
                'requiere_receta': True,
                'es_controlado': False,
                'descripcion': 'Antiinflamatorio no esteroideo.'
            },
            {
                'sku': 'AMX-003',
                'nombre_comercial': 'Amoxicilina 500 mg',
                'nombre_generico': 'Amoxicilina',
                'categoria': 'Medicamentos',
                'laboratorio': 'Roche',
                'forma_farmaceutica': 'capsula',
                'concentracion': '500 mg',
                'presentacion': 'Caja x 16 cápsulas',
                'unidad_medida': 'caja',
                'precio_compra': 12.00,
                'precio_venta': 25.00,
                'stock_minimo': 20,
                'requiere_receta': True,
                'es_controlado': False,
                'descripcion': 'Antibiótico de amplio espectro.'
            },
            {
                'sku': 'VITC-004',
                'nombre_comercial': 'Vitamina C 1000 mg',
                'nombre_generico': 'Ácido ascórbico',
                'categoria': 'Suplementos',
                'laboratorio': 'Sanofi',
                'forma_farmaceutica': 'tableta',
                'concentracion': '1000 mg',
                'presentacion': 'Frasco x 60 tabletas',
                'unidad_medida': 'frasco',
                'precio_compra': 15.00,
                'precio_venta': 29.90,
                'stock_minimo': 5,
                'requiere_receta': False,
                'es_controlado': False,
                'descripcion': 'Refuerza el sistema inmunológico.'
            },
            {
                'sku': 'CREMA-005',
                'nombre_comercial': 'Crema Hidratante',
                'nombre_generico': '',
                'categoria': 'Cuidado Personal',
                'laboratorio': 'Novartis',
                'forma_farmaceutica': 'crema',
                'concentracion': '',
                'presentacion': 'Tubo x 200 ml',
                'unidad_medida': 'unidad',
                'precio_compra': 18.00,
                'precio_venta': 35.00,
                'stock_minimo': 8,
                'requiere_receta': False,
                'es_controlado': False,
                'descripcion': 'Hidratación profunda para piel seca.'
            },
        ]
        
        productos_creados = []
        for prod_data in productos_data:
            categoria = Categoria.objects.get(nombre=prod_data['categoria'])
            laboratorio = Laboratorio.objects.get(nombre=prod_data['laboratorio'])
            
            producto, created = Producto.objects.get_or_create(
                sku=prod_data['sku'],
                defaults={
                    'nombre_comercial': prod_data['nombre_comercial'],
                    'nombre_generico': prod_data['nombre_generico'],
                    'categoria': categoria,
                    'laboratorio': laboratorio,
                    'forma_farmaceutica': prod_data['forma_farmaceutica'],
                    'concentracion': prod_data['concentracion'],
                    'presentacion': prod_data['presentacion'],
                    'unidad_medida': prod_data['unidad_medida'],
                    'precio_compra': Decimal(str(prod_data['precio_compra'])),
                    'precio_venta': Decimal(str(prod_data['precio_venta'])),
                    'stock_minimo': prod_data['stock_minimo'],
                    'requiere_receta': prod_data['requiere_receta'],
                    'es_controlado': prod_data['es_controlado'],
                    'descripcion': prod_data['descripcion'],
                }
            )
            if created:
                self.stdout.write(f'  ✓ Producto creado: {producto.nombre_comercial} ({producto.sku})')
                productos_creados.append(producto)
            else:
                self.stdout.write(f'  ℹ Producto ya existente: {producto.nombre_comercial}')
        
        # 4. Inventario y movimientos (si no existen)
        # Para cada producto, si no tiene inventario, se crea automáticamente por señal
        # Pero agregamos algunos movimientos de entrada para tener stock
        admin_user = User.objects.filter(is_superuser=True).first()
        if not admin_user:
            admin_user = User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
            self.stdout.write('  ✓ Usuario admin creado (admin/admin123)')
        
        for producto in productos_creados:
            # Asegurar inventario
            inventario, _ = Inventario.objects.get_or_create(producto=producto)
            
            # Si el stock_actual es 0, creamos un movimiento de entrada
            if inventario.stock_actual == 0:
                cantidad_entrada = randint(50, 200)
                MovimientoInventario.objects.create(
                    producto=producto,
                    tipo_movimiento='entrada',
                    cantidad=cantidad_entrada,
                    motivo='compra',
                    referencia=f'FACT-{randint(1000,9999)}',
                    usuario=admin_user,
                    observacion='Stock inicial por seed'
                )
                self.stdout.write(f'  ✓ Stock inicial para {producto.nombre_comercial}: +{cantidad_entrada}')
        
        # 5. Crear un par de movimientos de salida para algunos productos
        for producto in Producto.objects.all()[:3]:
            if producto.inventario.stock_actual > 10:
                cantidad_salida = randint(5, 20)
                MovimientoInventario.objects.create(
                    producto=producto,
                    tipo_movimiento='salida',
                    cantidad=cantidad_salida,
                    motivo='venta',
                    referencia=f'VENTA-{randint(100,999)}',
                    usuario=admin_user,
                    observacion='Venta de prueba'
                )
                self.stdout.write(f'  ✓ Venta de prueba para {producto.nombre_comercial}: -{cantidad_salida}')
        
        self.stdout.write(self.style.SUCCESS('✅ ¡Datos de prueba insertados correctamente!'))