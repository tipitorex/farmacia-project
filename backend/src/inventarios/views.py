from django.db.models import F, Q, Sum
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.rbac import tiene_permiso

from .models import InventarioProducto
from .serializers import InventarioProductoSerializer


def require_inventory_permission(user, permission_code, detail_message):
    if user.is_superuser or tiene_permiso(user, permission_code):
        return None

    return Response({"detail": detail_message}, status=status.HTTP_403_FORBIDDEN)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def stock_disponible_list(request):
    permission_denied = require_inventory_permission(
        request.user,
        "inventario.ver",
        "No tienes permisos para ver inventario.",
    )
    if permission_denied:
        return permission_denied

    items = InventarioProducto.objects.all()

    search = request.query_params.get("search", "").strip()
    status_filter = request.query_params.get("status", "all").strip().lower()

    if search:
        items = items.filter(
            Q(sku__icontains=search)
            | Q(nombre__icontains=search)
            | Q(categoria__icontains=search)
        )

    if status_filter == "disponible":
        items = items.filter(stock_actual__gt=F("stock_minimo"))
    elif status_filter == "stock_bajo":
        items = items.filter(stock_actual__gt=0, stock_actual__lte=F("stock_minimo"))
    elif status_filter == "sin_stock":
        items = items.filter(stock_actual=0)

    items = items.order_by("categoria", "nombre")

    summary = {
        "total_productos": items.count(),
        "stock_total_unidades": items.aggregate(total=Sum("stock_actual")).get("total") or 0,
        "productos_stock_bajo": items.filter(stock_actual__gt=0, stock_actual__lte=F("stock_minimo")).count(),
        "productos_sin_stock": items.filter(stock_actual=0).count(),
    }

    serializer = InventarioProductoSerializer(items, many=True)
    return Response({"summary": summary, "results": serializer.data})
