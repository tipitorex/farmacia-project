from django.db import migrations, models


def seed_initial_inventory(apps, schema_editor):
    inventario_model = apps.get_model("inventarios", "InventarioProducto")
    db_alias = schema_editor.connection.alias

    if inventario_model.objects.using(db_alias).exists():
        return

    inventario_model.objects.using(db_alias).bulk_create(
        [
            inventario_model(
                sku="MED-001",
                nombre="Ibuprofeno 400mg x20",
                categoria="Medicamentos",
                stock_actual=112,
                stock_minimo=15,
            ),
            inventario_model(
                sku="VIT-010",
                nombre="Multivitaminico x60",
                categoria="Vitaminas",
                stock_actual=43,
                stock_minimo=12,
            ),
            inventario_model(
                sku="DER-027",
                nombre="Protector solar FPS 50",
                categoria="Dermocosmetica",
                stock_actual=9,
                stock_minimo=10,
            ),
            inventario_model(
                sku="HIG-212",
                nombre="Jabon antibacterial 500ml",
                categoria="Higiene",
                stock_actual=67,
                stock_minimo=20,
            ),
            inventario_model(
                sku="BEB-055",
                nombre="Panal talla M x40",
                categoria="Mama y Bebe",
                stock_actual=0,
                stock_minimo=12,
            ),
            inventario_model(
                sku="AUX-100",
                nombre="Gasas esteriles x25",
                categoria="Primeros Auxilios",
                stock_actual=24,
                stock_minimo=8,
            ),
            inventario_model(
                sku="ADU-081",
                nombre="Calcio + Vitamina D x30",
                categoria="Adulto Mayor",
                stock_actual=6,
                stock_minimo=10,
            ),
            inventario_model(
                sku="MED-245",
                nombre="Paracetamol 500mg x20",
                categoria="Medicamentos",
                stock_actual=138,
                stock_minimo=25,
            ),
        ]
    )


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="InventarioProducto",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("sku", models.CharField(max_length=32, unique=True)),
                ("nombre", models.CharField(max_length=120)),
                ("categoria", models.CharField(max_length=80)),
                ("stock_actual", models.PositiveIntegerField(default=0)),
                ("stock_minimo", models.PositiveIntegerField(default=10)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"ordering": ["categoria", "nombre"]},
        ),
        migrations.RunPython(seed_initial_inventory, migrations.RunPython.noop),
    ]
