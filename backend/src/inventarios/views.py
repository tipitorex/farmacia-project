from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from core.rbac import tiene_permiso, ROLE_FARMACEUTICO
from .models import (
    Categoria,
    Subcategoria,
    Laboratorio,
    Producto,
    Inventario,
    MovimientoInventario,
    EntradaStock,
)
from .serializers import (
    CategoriaSerializer,
    SubcategoriaSerializer,
    LaboratorioSerializer,
    ProductoSerializer,
    InventarioSerializer,
    MovimientoInventarioSerializer,
    EntradaStockSerializer,
)


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["nombre", "descripcion"]
    ordering_fields = ["nombre", "created_at"]

    def get_queryset(self):
        queryset = super().get_queryset()
        estado = self.request.query_params.get("estado")
        if estado is not None:
            queryset = queryset.filter(estado=estado.lower() == "true")
        return queryset

    def perform_destroy(self, instance):
        instance.estado = False
        instance.save()


class SubcategoriaViewSet(viewsets.ModelViewSet):
    queryset = Subcategoria.objects.all()
    serializer_class = SubcategoriaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["nombre", "descripcion"]

    def get_queryset(self):
        queryset = super().get_queryset()
        categoria_id = self.request.query_params.get("categoria")
        if categoria_id:
            queryset = queryset.filter(categoria_id=categoria_id)
        return queryset


class LaboratorioViewSet(viewsets.ModelViewSet):
    queryset = Laboratorio.objects.all()
    serializer_class = LaboratorioSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["nombre", "pais", "contacto_representante"]
    ordering_fields = ["nombre", "created_at"]


class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["sku", "nombre_comercial", "nombre_generico"]
    ordering_fields = ["sku", "nombre_comercial", "precio_venta", "created_at"]

    def get_queryset(self):
        queryset = super().get_queryset().select_related("categoria", "laboratorio", "subcategoria", "inventario")

        categoria = self.request.query_params.get("categoria")
        if categoria:
            queryset = queryset.filter(categoria_id=categoria)

        laboratorio = self.request.query_params.get("laboratorio")
        if laboratorio:
            queryset = queryset.filter(laboratorio_id=laboratorio)

        estado = self.request.query_params.get("estado")
        if estado is not None:
            queryset = queryset.filter(estado=estado.lower() == "true")

        requiere_receta = self.request.query_params.get("requiere_receta")
        if requiere_receta is not None:
            queryset = queryset.filter(requiere_receta=requiere_receta.lower() == "true")

        precio_min = self.request.query_params.get("precio_min")
        if precio_min:
            queryset = queryset.filter(precio_venta__gte=precio_min)

        precio_max = self.request.query_params.get("precio_max")
        if precio_max:
            queryset = queryset.filter(precio_venta__lte=precio_max)

        return queryset

    @action(detail=True, methods=["get"])
    def inventario(self, request, pk=None):
        producto = self.get_object()
        inventario = get_object_or_404(Inventario, producto=producto)
        serializer = InventarioSerializer(inventario)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def ajustar_stock(self, request, pk=None):
        producto = self.get_object()

        tipo_movimiento = request.data.get("tipo_movimiento")
        cantidad = request.data.get("cantidad")
        motivo = request.data.get("motivo")
        observacion = request.data.get("observacion", "")

        if not tipo_movimiento or not cantidad or not motivo:
            return Response({"error": "Se requiere tipo_movimiento, cantidad y motivo"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            movimiento = MovimientoInventario.objects.create(
                producto=producto,
                tipo_movimiento=tipo_movimiento,
                cantidad=int(cantidad),
                motivo=motivo,
                observacion=observacion,
                usuario=request.user,
            )

            inventario = Inventario.objects.get(producto=producto)
            return Response(
                {
                    "message": "Stock ajustado correctamente",
                    "movimiento": MovimientoInventarioSerializer(movimiento).data,
                    "inventario": InventarioSerializer(inventario).data,
                },
                status=status.HTTP_200_OK,
            )
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"Error al ajustar stock: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=["get"])
    def stock_bajo(self, request):
        productos_bajo_stock = []
        for producto in self.get_queryset():
            if hasattr(producto, "inventario") and producto.inventario.necesita_reabastecimiento:
                productos_bajo_stock.append(producto)
        serializer = self.get_serializer(productos_bajo_stock, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def sin_stock(self, request):
        productos_sin_stock = []
        for producto in self.get_queryset():
            if hasattr(producto, "inventario") and producto.inventario.stock_disponible == 0:
                productos_sin_stock.append(producto)
        serializer = self.get_serializer(productos_sin_stock, many=True)
        return Response(serializer.data)


class MovimientoInventarioViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MovimientoInventario.objects.all()
    serializer_class = MovimientoInventarioSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["producto__nombre_comercial", "producto__sku", "referencia"]
    ordering_fields = ["fecha_movimiento", "created_at"]

    def get_queryset(self):
        queryset = super().get_queryset().select_related("producto", "usuario")

        producto_id = self.request.query_params.get("producto")
        if producto_id:
            queryset = queryset.filter(producto_id=producto_id)

        tipo = self.request.query_params.get("tipo_movimiento")
        if tipo:
            queryset = queryset.filter(tipo_movimiento=tipo)

        return queryset


class EntradaStockViewSet(viewsets.ModelViewSet):
    queryset = EntradaStock.objects.all()
    serializer_class = EntradaStockSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return super().get_queryset().select_related("producto", "usuario").order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    def create(self, request, *args, **kwargs):
        if not (
            tiene_permiso(request.user, "inventario.registrar_entrada")
            or request.user.groups.filter(name=ROLE_FARMACEUTICO).exists()
            or request.user.is_superuser
        ):
            return Response(
                {"detail": "No tienes permiso para registrar entradas de stock."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().create(request, *args, **kwargs)

    @action(detail=False, methods=["get"])
    def por_producto(self, request):
        producto_id = request.query_params.get("producto_id")
        if not producto_id:
            return Response({"detail": "Parámetro producto_id requerido."}, status=status.HTTP_400_BAD_REQUEST)

        entradas = self.get_queryset().filter(producto_id=producto_id)
        serializer = self.get_serializer(entradas, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def ultimas(self, request):
        entradas = self.get_queryset()[:10]
        serializer = self.get_serializer(entradas, many=True)
        return Response(serializer.data)
