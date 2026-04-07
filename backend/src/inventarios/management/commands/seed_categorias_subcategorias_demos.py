from django.core.management.base import BaseCommand
from inventarios.models import Categoria, Subcategoria
import random

class Command(BaseCommand):
    help = 'Genera categorías y subcategorías de prueba'

    def handle(self, *args, **kwargs):
        categorias_data = [
            ("Analgésicos", ["Paracetamol", "Ibuprofeno"]),
            ("Antibióticos", ["Penicilina", "Amoxicilina"]),
            ("Vitaminas", ["Vitamina C", "Vitamina D"]),
            ("Dermatológicos", ["Cremas", "Pomadas"]),
            ("Cardiología", ["Hipertensión"]),
            ("Gastroenterología", ["Antiácidos"]),
            ("Pediatría", ["Jarabes infantiles"]),
            ("Neurología", ["Antidepresivos"]),
            ("Oftalmología", ["Gotas oculares"]),
            ("Endocrinología", ["Diabetes"]),
        ]

        for nombre_cat, subcats in categorias_data:
            categoria, created = Categoria.objects.get_or_create(
                nombre=nombre_cat,
                defaults={
                    "descripcion": f"Categoría de {nombre_cat}"
                }
            )

            if created:
                self.stdout.write(self.style.SUCCESS(f"✔ Categoría creada: {nombre_cat}"))
            else:
                self.stdout.write(self.style.WARNING(f"⚠ Categoría ya existe: {nombre_cat}"))

            # Crear subcategorías
            for sub in subcats:
                sub_obj, sub_created = Subcategoria.objects.get_or_create(
                    nombre=sub,
                    categoria=categoria,
                    defaults={
                        "descripcion": f"Subcategoría de {sub}"
                    }
                )

                if sub_created:
                    self.stdout.write(self.style.SUCCESS(f"   ↳ Subcategoría creada: {sub}"))
                else:
                    self.stdout.write(self.style.WARNING(f"   ↳ Subcategoría ya existe: {sub}"))

        self.stdout.write(self.style.SUCCESS("Semillero completado correctamente"))