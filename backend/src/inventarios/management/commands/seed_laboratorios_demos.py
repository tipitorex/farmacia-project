from django.core.management.base import BaseCommand
from inventarios.models import Laboratorio
import random

class Command(BaseCommand):
    help = 'Genera laboratorios de prueba'

    def handle(self, *args, **kwargs):
        nombres = [
            "Lab FarmaBol", "BioGen", "SaludPlus", "Andes Pharma",
            "NovaLab", "Meditech", "VitalLab", "CuraMed",
            "PharmaLife", "EcoLab"
        ]

        paises = ["Bolivia", "Argentina", "Brasil", "Chile", "Perú"]

        for nombre in nombres:
            obj, created = Laboratorio.objects.get_or_create(
                nombre=nombre,
                defaults={
                    "pais": random.choice(paises),
                    "telefono": f"+5917{random.randint(1000000, 9999999)}",
                    "email": f"{nombre.lower().replace(' ', '')}@mail.com",
                    "direccion": "Dirección de prueba",
                    "contacto_representante": "Juan Pérez",
                }
            )

            if created:
                self.stdout.write(self.style.SUCCESS(f"✔ {nombre} creado"))
            else:
                self.stdout.write(self.style.WARNING(f"⚠ {nombre} ya existe"))

        self.stdout.write(self.style.SUCCESS("Seeder ejecutado para laboratorios completado con éxito."))