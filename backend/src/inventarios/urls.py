"""
from django.urls import path

urlpatterns = [
    # Base de rutas de la app inventarios (pendiente de endpoints).
]
"""
from rest_framework.routers import DefaultRouter
from .views import CategoriaViewSet, SubcategoriaViewSet, LaboratorioViewSet

router = DefaultRouter()
router.register(r'categorias', CategoriaViewSet, basename='categorias')
router.register(r'subcategorias', SubcategoriaViewSet, basename='subcategorias')
router.register(r'laboratorios', LaboratorioViewSet, basename='laboratorios')

urlpatterns = router.urls