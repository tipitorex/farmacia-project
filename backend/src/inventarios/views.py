from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Categoria, Subcategoria, Laboratorio
from .serializers import CategoriaSerializer, SubcategoriaSerializer, LaboratorioSerializer

from django.db.models import Q

from .permissions import (
    PuedeGestionarCategorias, 
    PuedeVerCategorias,
    PuedeGestionarSubcategorias,
    PuedeVerSubcategorias,
    PuedeGestionarLaboratorios,
    PuedeVerLaboratorios
)      

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all().order_by("-id")
    serializer_class = CategoriaSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [PuedeVerCategorias()]
        return [PuedeGestionarCategorias()]

    def get_queryset(self):
        queryset = super().get_queryset()

        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(nombre__icontains=search) |
                Q(descripcion__icontains=search)
            )

        status = self.request.query_params.get("status")

        if status == "active":
            queryset = queryset.filter(estado=True)
        elif status == "inactive":
            queryset = queryset.filter(estado=False)

        return queryset
    

    def destroy(self, request, *args, **kwargs):    
        categoria = self.get_object()
        categoria.estado = False
        categoria.save()
        return Response({"message": "Categoría desactivada"}, status=status.HTTP_200_OK)
    

class SubcategoriaViewSet(viewsets.ModelViewSet):
    queryset = Subcategoria.objects.all()
    serializer_class = SubcategoriaSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [PuedeVerSubcategorias()]
        return [PuedeGestionarSubcategorias()]
    
    def get_queryset(self):
        queryset = super().get_queryset()

        categoria = self.request.query_params.get("categoria")
        if categoria:
            queryset = queryset.filter(categoria_id=categoria)

        status = self.request.query_params.get("status")

        if status == "active":
            queryset = queryset.filter(estado=True)
        elif status == "inactive":
            queryset = queryset.filter(estado=False)

        return queryset

    def destroy(self, request, *args, **kwargs):
        subcategoria = self.get_object()
        subcategoria.estado = False
        subcategoria.save()
        return Response({"message": "Subcategoría desactivada"}, status=status.HTTP_200_OK)
    

class LaboratorioViewSet(viewsets.ModelViewSet):
    queryset = Laboratorio.objects.all().order_by("-id")
    serializer_class = LaboratorioSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [PuedeVerLaboratorios()]
        return [PuedeGestionarLaboratorios()]

    def get_queryset(self):
        queryset = super().get_queryset()

        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(nombre__icontains=search) |
                Q(pais__icontains=search) |
                Q(email__icontains=search)
            )

        status = self.request.query_params.get("status")

        if status == "active":
            queryset = queryset.filter(estado=True)
        elif status == "inactive":
            queryset = queryset.filter(estado=False)

        return queryset

    def destroy(self, request, *args, **kwargs):
        """
        Soft delete → desactivar laboratorio
        """
        laboratorio = self.get_object()
        laboratorio.estado = False
        laboratorio.save()
        return Response(
            {"message": "Laboratorio desactivado"},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=["patch"])
    def activar(self, request, pk=None):
        lab = self.get_object()
        lab.estado = True
        lab.save()
        return Response({"message": "Laboratorio activado"}, status=status.HTTP_200_OK)