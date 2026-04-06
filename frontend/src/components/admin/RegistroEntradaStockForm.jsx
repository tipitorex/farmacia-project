import { useState, useEffect } from "react";
import { crearEntradaStock, obtenerProductos } from "../../services/inventarioService";

export default function RegistroEntradaStockForm({ onSuccess, isLoading = false, compact = false, onCancel }) {
  const [productos, setProductos] = useState([]);
  const [formData, setFormData] = useState({
    producto: "",
    cantidad: "",
    motivo: "reposicion",
    descripcion: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const MOTIVOS = [
    { value: "reposicion", label: "Reposición Proveedor" },
    { value: "devolucion", label: "Devolución de Cliente" },
    { value: "ajuste", label: "Ajuste de Inventario" },
    { value: "correccion", label: "Corrección de Conteo" },
    { value: "otro", label: "Otro" },
  ];

  // Cargar productos al montar el componente
  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const data = await obtenerProductos();
      setProductos(data.results || data);
    } catch (error) {
      console.error("Error cargando productos:", error);
      setErrors({ general: "Error al cargar los productos. Intenta nuevamente." });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.producto) {
      newErrors.producto = "El producto es requerido.";
    }

    if (!formData.cantidad || formData.cantidad <= 0) {
      newErrors.cantidad = "La cantidad debe ser mayor a 0.";
    }

    if (!formData.motivo) {
      newErrors.motivo = "El motivo es requerido.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      setSuccessMessage("");

      const data = {
        producto: parseInt(formData.producto),
        cantidad: parseInt(formData.cantidad),
        motivo: formData.motivo,
        descripcion: formData.descripcion || null,
      };

      await crearEntradaStock(data);

      setSuccessMessage("✓ Entrada de stock registrada correctamente.");
      setFormData({
        producto: "",
        cantidad: "",
        motivo: "reposicion",
        descripcion: "",
      });

      if (onSuccess) {
        onSuccess();
      }

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error registrando entrada:", error);
      setErrors({
        general: error.message || "Error al registrar la entrada. Intenta nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  };
  const form = (
    <>
      {successMessage && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
          {successMessage}
        </div>
      )}

      {errors.general && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className={compact ? "space-y-4" : "mt-6 space-y-4"}>
        <div>
          <label htmlFor="producto" className="mb-1 block text-sm font-medium text-slate-700">
            Producto
          </label>
          <select
            id="producto"
            name="producto"
            value={formData.producto}
            onChange={handleInputChange}
            disabled={loading || isLoading}
            className={`h-11 w-full rounded-xl border ${
              errors.producto ? "border-red-500" : "border-slate-300"
            } bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 disabled:bg-slate-100 disabled:text-slate-500`}
          >
            <option value="">Selecciona un producto</option>
            {productos.map((producto) => (
              <option key={producto.id} value={producto.id}>
                {producto.nombre_comercial || producto.nombre} (SKU: {producto.sku})
              </option>
            ))}
          </select>
          {errors.producto && <p className="mt-1 text-sm text-red-600">{errors.producto}</p>}
        </div>

        <div>
          <label htmlFor="cantidad" className="mb-1 block text-sm font-medium text-slate-700">
            Cantidad
          </label>
          <input
            type="number"
            id="cantidad"
            name="cantidad"
            min="1"
            value={formData.cantidad}
            onChange={handleInputChange}
            disabled={loading || isLoading}
            placeholder="Ej: 25"
            className={`h-11 w-full rounded-xl border ${
              errors.cantidad ? "border-red-500" : "border-slate-300"
            } bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 disabled:bg-slate-100 disabled:text-slate-500`}
          />
          {errors.cantidad && <p className="mt-1 text-sm text-red-600">{errors.cantidad}</p>}
        </div>

        <div>
          <label htmlFor="motivo" className="mb-1 block text-sm font-medium text-slate-700">
            Motivo
          </label>
          <select
            id="motivo"
            name="motivo"
            value={formData.motivo}
            onChange={handleInputChange}
            disabled={loading || isLoading}
            className={`h-11 w-full rounded-xl border ${
              errors.motivo ? "border-red-500" : "border-slate-300"
            } bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 disabled:bg-slate-100 disabled:text-slate-500`}
          >
            {MOTIVOS.map((motivo) => (
              <option key={motivo.value} value={motivo.value}>
                {motivo.label}
              </option>
            ))}
          </select>
          {errors.motivo && <p className="mt-1 text-sm text-red-600">{errors.motivo}</p>}
        </div>

        <div>
          <label htmlFor="descripcion" className="mb-1 block text-sm font-medium text-slate-700">
            Descripción (opcional)
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
            disabled={loading || isLoading}
            placeholder="Ej: Reposición proveedor abril"
            rows="3"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 disabled:bg-slate-100 disabled:text-slate-500"
          />
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {compact && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              disabled={loading || isLoading}
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={loading || isLoading}
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-600 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading || isLoading ? "Registrando..." : "Registrar entrada"}
          </button>
        </div>
      </form>
    </>
  );

  if (compact) return form;

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-md">
      <h2 className="text-2xl font-black text-slate-900">Registrar entrada de stock</h2>
      <p className="mt-2 text-sm text-slate-600">
        Suma unidades al inventario cuando llega nueva mercadería.
      </p>
      {form}
    </div>
  );
}
