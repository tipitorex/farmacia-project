from django.core.management.base import BaseCommand

from core.rbac import seed_roles_y_permisos, sincronizar_roles_usuarios_existentes


class Command(BaseCommand):
    help = "Crea permisos semilla en español y grupos base de roles para farmacia."

    def add_arguments(self, parser):
        parser.add_argument(
            "--sincronizar-usuarios",
            action="store_true",
            help="Asigna rol inicial a usuarios existentes segun su estado actual.",
        )

    def handle(self, *args, **options):
        seed_roles_y_permisos()
        self.stdout.write(self.style.SUCCESS("Permisos y roles semilla creados/actualizados."))

        if options.get("sincronizar_usuarios"):
            sincronizar_roles_usuarios_existentes()
            self.stdout.write(self.style.SUCCESS("Usuarios existentes sincronizados con roles base."))
