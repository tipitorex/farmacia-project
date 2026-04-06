from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoriaViewSet, SubcategoriaViewSet, LaboratorioViewSet,
    ProductoViewSet, MovimientoInventarioViewSet
)

router = DefaultRouter()
router.register(r'categorias', CategoriaViewSet)
router.register(r'subcategorias', SubcategoriaViewSet)
router.register(r'laboratorios', LaboratorioViewSet)
router.register(r'productos', ProductoViewSet)
router.register(r'movimientos', MovimientoInventarioViewSet)

urlpatterns = [
    path('', include(router.urls)),
]