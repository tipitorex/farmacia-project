from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q

from .models import Producto, EntradaStock
from .serializers import ProductoSerializer, EntradaStockSerializer
from core.rbac import tiene_permiso, ROLE_FARMACEUTICO


class ProductoViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar productos."""
    
    queryset = Producto.objects.filter(activo=True)
    serializer_class = ProductoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filtrar productos activos."""
        return super().get_queryset().order_by('-created_at')


class EntradaStockViewSet(viewsets.ModelViewSet):
    """ViewSet para registrar entradas de stock."""
    
    queryset = EntradaStock.objects.all()
    serializer_class = EntradaStockSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Retornar todas las entradas ordenadas por fecha."""
        return super().get_queryset().order_by('-created_at')

    def perform_create(self, serializer):
        """Asignar usuario actual al crear entrada de stock."""
        serializer.save(usuario=self.request.user)

    def create(self, request, *args, **kwargs):
        """Crear entrada de stock con validación de permisos."""
        # Verificar si el usuario tiene permiso de registrar entrada
        if not (tiene_permiso(request.user, 'registrar_entrada_stock') or 
                request.user.groups.filter(name=ROLE_FARMACEUTICO).exists() or
                request.user.is_superuser):
            return Response(
                {'detail': 'No tienes permiso para registrar entradas de stock.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().create(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def por_producto(self, request):
        """Obtener entradas filtradas por producto."""
        producto_id = request.query_params.get('producto_id')
        if not producto_id:
            return Response(
                {'detail': 'Parámetro producto_id requerido.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        entradas = self.get_queryset().filter(producto_id=producto_id)
        serializer = self.get_serializer(entradas, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def ultimas(self, request):
        """Obtener últimas 10 entradas."""
        entradas = self.get_queryset()[:10]
        serializer = self.get_serializer(entradas, many=True)
        return Response(serializer.data)

