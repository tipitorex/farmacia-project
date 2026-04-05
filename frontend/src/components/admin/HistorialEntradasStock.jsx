import { useState, useEffect } from "react";
import { obtenerUltimasEntradas } from "../../services/inventarioService";

export default function HistorialEntradasStock({ refresh = 0 }) {
  const [entradas, setEntradas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarEntradas();
  }, [refresh]);

  const cargarEntradas = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await obtenerUltimasEntradas();
      setEntradas(data.results || data);
    } catch (error) {
      console.error("Error cargando entradas:", error);
      setError("Error al cargar el historial.");
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMotivoLabel = (motivo) => {
    const motivos = {
      reposicion: "Reposición Proveedor",
      devolucion: "Devolución de Cliente",
      ajuste: "Ajuste de Inventario",
      correccion: "Corrección de Conteo",
      otro: "Otro",
    };
    return motivos[motivo] || motivo;
  };

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-md mt-8">
      <h2 className="text-2xl font-black text-slate-900">Historial de entradas</h2>
      <p className="mt-2 text-sm text-slate-600">
        Visualiza el registro de todas las entradas de stock realizadas.
      </p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-4 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-6 text-center text-slate-500">
          <p>Cargando historial...</p>
        </div>
      ) : entradas.length === 0 ? (
        <div className="mt-6 text-center text-slate-500">
          <p>Aun no se registraron entradas de stock.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left font-semibold text-slate-700">FECHA</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">SKU</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">PRODUCTO</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">CANTIDAD</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">MOTIVO</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">USUARIO</th>
              </tr>
            </thead>
            <tbody>
              {entradas.map((entrada) => (
                <tr key={entrada.id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-700 text-xs">
                    {formatearFecha(entrada.created_at)}
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-xs">
                    {entrada.producto}
                  </td>
                  <td className="px-4 py-3 text-slate-900 font-medium">
                    {entrada.producto_nombre}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-900 font-semibold">
                    {entrada.cantidad}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <span className="inline-block px-2 py-1 bg-teal-100 text-teal-800 rounded text-xs font-medium">
                      {getMotivoLabel(entrada.motivo)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700 text-xs">
                    {entrada.usuario_nombre || "Sistema"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
