from django.urls import path
from .views import stock_disponible_list

urlpatterns = [
    path("stock/", stock_disponible_list, name="inventario-stock-list"),
]
