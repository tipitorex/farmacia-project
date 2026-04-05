import { request } from "./apiClient";

/**
 * Obtener lista de productos activos
 */
export async function obtenerProductos() {
  const response = await request("/api/inventarios/productos/");

  if (!response.ok) {
    throw new Error(`Error al obtener productos: ${response.status}`);
  }

  return response.json();
}

/**
 * Crear una entrada de stock
 * @param {Object} data - Datos de la entrada
 * @param {number} data.producto - ID del producto
 * @param {number} data.cantidad - Cantidad a ingresar
 * @param {string} data.motivo - Motivo de la entrada
 * @param {string} data.descripcion - Descripción opcional
 */
export async function crearEntradaStock(data) {
  const response = await request("/api/inventarios/entradas-stock/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || `Error al registrar entrada: ${response.status}`);
  }

  return response.json();
}

/**
 * Obtener historial de entradas de stock
 */
export async function obtenerEntradasStock() {
  const response = await request("/api/inventarios/entradas-stock/");

  if (!response.ok) {
    throw new Error(`Error al obtener entradas: ${response.status}`);
  }

  return response.json();
}

/**
 * Obtener últimas entradas de stock
 */
export async function obtenerUltimasEntradas() {
  const response = await request("/api/inventarios/entradas-stock/ultimas/");

  if (!response.ok) {
    throw new Error(`Error al obtener últimas entradas: ${response.status}`);
  }

  return response.json();
}

/**
 * Obtener entradas filtradas por producto
 * @param {number} productoId - ID del producto
 */
export async function obtenerEntradasPorProducto(productoId) {
  const response = await request(`/api/inventarios/entradas-stock/por_producto/?producto_id=${productoId}`);

  if (!response.ok) {
    throw new Error(`Error al obtener entradas: ${response.status}`);
  }

  return response.json();
}
