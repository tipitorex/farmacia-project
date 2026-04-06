import { requestJsonWithAuthRetry } from './apiClient';

const buildQuery = (params) => {
  if (!params) return '';
  return '?' + new URLSearchParams(params).toString();
};

export const categoriasService = {
  listar: (params) => requestJsonWithAuthRetry(`/api/inventarios/categorias/${buildQuery(params)}`),
  crear: (data) => requestJsonWithAuthRetry('/api/inventarios/categorias/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  actualizar: (id, data) => requestJsonWithAuthRetry(`/api/inventarios/categorias/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  eliminar: (id) => requestJsonWithAuthRetry(`/api/inventarios/categorias/${id}/`, {
    method: 'DELETE',
  }),
};

export const subcategoriasService = {
  listar: (params) => requestJsonWithAuthRetry(`/api/inventarios/subcategorias/${buildQuery(params)}`),
  crear: (data) => requestJsonWithAuthRetry('/api/inventarios/subcategorias/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  actualizar: (id, data) => requestJsonWithAuthRetry(`/api/inventarios/subcategorias/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  eliminar: (id) => requestJsonWithAuthRetry(`/api/inventarios/subcategorias/${id}/`, {
    method: 'DELETE',
  }),
};

export const laboratoriosService = {
  listar: (params) => requestJsonWithAuthRetry(`/api/inventarios/laboratorios/${buildQuery(params)}`),
  crear: (data) => requestJsonWithAuthRetry('/api/inventarios/laboratorios/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  actualizar: (id, data) => requestJsonWithAuthRetry(`/api/inventarios/laboratorios/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  eliminar: (id) => requestJsonWithAuthRetry(`/api/inventarios/laboratorios/${id}/`, {
    method: 'DELETE',
  }),
};

export const productosService = {
  listar: (params) => requestJsonWithAuthRetry(`/api/inventarios/productos/${buildQuery(params)}`),
  obtener: (id) => requestJsonWithAuthRetry(`/api/inventarios/productos/${id}/`),
  crear: (data) => requestJsonWithAuthRetry('/api/inventarios/productos/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  actualizar: (id, data) => requestJsonWithAuthRetry(`/api/inventarios/productos/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  eliminar: (id) => requestJsonWithAuthRetry(`/api/inventarios/productos/${id}/`, {
    method: 'DELETE',
  }),
  obtenerInventario: (id) => requestJsonWithAuthRetry(`/api/inventarios/productos/${id}/inventario/`),
  ajustarStock: (id, data) => requestJsonWithAuthRetry(`/api/inventarios/productos/${id}/ajustar_stock/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  stockBajo: () => requestJsonWithAuthRetry('/api/inventarios/productos/stock_bajo/'),
  sinStock: () => requestJsonWithAuthRetry('/api/inventarios/productos/sin_stock/'),
};

export const movimientosService = {
  listar: (params) => requestJsonWithAuthRetry(`/api/inventarios/movimientos/${buildQuery(params)}`),
};

export async function obtenerProductos() {
  return productosService.listar();
}

export async function crearEntradaStock(data) {
  return requestJsonWithAuthRetry('/api/inventarios/entradas-stock/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

export async function obtenerEntradasStock() {
  return requestJsonWithAuthRetry('/api/inventarios/entradas-stock/');
}

export async function obtenerUltimasEntradas() {
  return requestJsonWithAuthRetry('/api/inventarios/entradas-stock/ultimas/');
}

export async function obtenerEntradasPorProducto(productoId) {
  return requestJsonWithAuthRetry(`/api/inventarios/entradas-stock/por_producto/?producto_id=${productoId}`);
}
