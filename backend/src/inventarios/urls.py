from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductoViewSet, EntradaStockViewSet

router = DefaultRouter()
router.register(r'productos', ProductoViewSet, basename='producto')
router.register(r'entradas-stock', EntradaStockViewSet, basename='entrada-stock')

urlpatterns = [
    path('', include(router.urls)),
]