import { requestJsonWithAuthRetry } from './apiClient';

// Helper para construir query string
const buildQuery = (params) => {
  if (!params) return '';
  return '?' + new URLSearchParams(params).toString();
};

// Servicio de Categorías
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

// Servicio de Subcategorías (opcional)
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

// Servicio de Laboratorios
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

// Servicio de Productos
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

// Servicio de Movimientos (solo lectura)
export const movimientosService = {
  listar: (params) => requestJsonWithAuthRetry(`/api/inventarios/movimientos/${buildQuery(params)}`),
};