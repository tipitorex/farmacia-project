import { requestJsonWithAuthRetry } from "./apiClient";

/**
 * Obtener lista de productos activos
 */
export async function obtenerProductos() {
  return requestJsonWithAuthRetry("/api/inventarios/productos/");
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
  return requestJsonWithAuthRetry("/api/inventarios/entradas-stock/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

/**
 * Obtener historial de entradas de stock
 */
export async function obtenerEntradasStock() {
  return requestJsonWithAuthRetry("/api/inventarios/entradas-stock/");
}

/**
 * Obtener últimas entradas de stock
 */
export async function obtenerUltimasEntradas() {
  return requestJsonWithAuthRetry("/api/inventarios/entradas-stock/ultimas/");
}

/**
 * Obtener entradas filtradas por producto
 * @param {number} productoId - ID del producto
 */
export async function obtenerEntradasPorProducto(productoId) {
  return requestJsonWithAuthRetry(`/api/inventarios/entradas-stock/por_producto/?producto_id=${productoId}`);
}
