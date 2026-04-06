import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import { productosService, categoriasService, laboratoriosService } from "../../services/inventarioService";

export default function AdminProductosPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [laboratorios, setLaboratorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    sku: "",
    nombre_comercial: "",
    nombre_generico: "",
    descripcion: "",
    categoria_id: "",
    laboratorio_id: "",
    forma_farmaceutica: "tableta",
    concentracion: "",
    presentacion: "",
    unidad_medida: "unidad",
    precio_compra: "",
    precio_venta: "",
    stock_minimo: 0,
    requiere_receta: false,
    es_controlado: false,
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productosRes, categoriasRes, laboratoriosRes] = await Promise.all([
        productosService.listar(),
        categoriasService.listar({ estado: true }),
        laboratoriosService.listar({ estado: true }),
      ]);
      setProductos(Array.isArray(productosRes) ? productosRes : []);
      setCategorias(Array.isArray(categoriasRes) ? categoriasRes : []);
      setLaboratorios(Array.isArray(laboratoriosRes) ? laboratoriosRes : []);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError("No se pudieron cargar los productos. Intente de nuevo.");
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Validación y envío
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validar campos numéricos
    const precioCompra = parseFloat(formData.precio_compra);
    const precioVenta = parseFloat(formData.precio_venta);
    const stockMinimo = parseInt(formData.stock_minimo, 10);
    const categoriaId = parseInt(formData.categoria_id, 10);
    const laboratorioId = parseInt(formData.laboratorio_id, 10);

    if (isNaN(precioCompra) || precioCompra < 0) {
      setError("El precio de compra debe ser un número válido mayor o igual a 0.");
      return;
    }
    if (isNaN(precioVenta) || precioVenta < 0) {
      setError("El precio de venta debe ser un número válido mayor o igual a 0.");
      return;
    }
    if (isNaN(stockMinimo) || stockMinimo < 0) {
      setError("El stock mínimo debe ser un número entero válido.");
      return;
    }
    if (isNaN(categoriaId)) {
      setError("Debes seleccionar una categoría.");
      return;
    }
    if (isNaN(laboratorioId)) {
      setError("Debes seleccionar un laboratorio.");
      return;
    }

    // Construir payload con los tipos correctos
    const payload = {
      sku: formData.sku,
      nombre_comercial: formData.nombre_comercial,
      nombre_generico: formData.nombre_generico,
      descripcion: formData.descripcion,
      categoria_id: categoriaId,
      laboratorio_id: laboratorioId,
      forma_farmaceutica: formData.forma_farmaceutica,
      concentracion: formData.concentracion,
      presentacion: formData.presentacion,
      unidad_medida: formData.unidad_medida,
      precio_compra: precioCompra,
      precio_venta: precioVenta,
      stock_minimo: stockMinimo,
      requiere_receta: formData.requiere_receta,
      es_controlado: formData.es_controlado,
    };

    try {
      setSaving(true);
      if (editingProduct) {
        await productosService.actualizar(editingProduct.id, payload);
      } else {
        await productosService.crear(payload);
      }
      resetForm();
      cargarDatos();
    } catch (err) {
      console.error("Error al guardar:", err);
      let msg = "Error al guardar el producto. Revise los datos.";
      if (err.detail) msg = err.detail;
      else if (err.message) msg = err.message;
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setError(null);
    setShowForm(true);
  };

  const handleEdit = (producto) => {
    setEditingProduct(producto);
    setError(null);
    setFormData({
      sku: producto.sku,
      nombre_comercial: producto.nombre_comercial,
      nombre_generico: producto.nombre_generico,
      descripcion: producto.descripcion,
      categoria_id: producto.categoria,
      laboratorio_id: producto.laboratorio,
      forma_farmaceutica: producto.forma_farmaceutica,
      concentracion: producto.concentracion,
      presentacion: producto.presentacion,
      unidad_medida: producto.unidad_medida,
      precio_compra: producto.precio_compra,
      precio_venta: producto.precio_venta,
      stock_minimo: producto.stock_minimo,
      requiere_receta: producto.requiere_receta,
      es_controlado: producto.es_controlado,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;
    setError(null);
    try {
      await productosService.eliminar(id);
      cargarDatos();
    } catch (err) {
      console.error("Error al eliminar:", err);
      setError("Error al eliminar el producto");
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({
      sku: "",
      nombre_comercial: "",
      nombre_generico: "",
      descripcion: "",
      categoria_id: "",
      laboratorio_id: "",
      forma_farmaceutica: "tableta",
      concentracion: "",
      presentacion: "",
      unidad_medida: "unidad",
      precio_compra: "",
      precio_venta: "",
      stock_minimo: 0,
      requiere_receta: false,
      es_controlado: false,
    });
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <AdminLayout activeSection="products" currentUser={user} onLogout={handleLogout}>
        <div className="p-6">Cargando productos...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeSection="products" currentUser={user} onLogout={handleLogout}>
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-md">
        <h1 className="text-2xl font-black text-slate-900">Admin / Productos</h1>
        <p className="mt-2 text-sm text-slate-600 mb-6">Gestión completa de productos.</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex justify-end mb-4">
          <button
            onClick={handleOpenCreate}
            className="rounded-lg bg-teal-700 px-4 py-2 text-white transition-colors hover:bg-teal-600"
          >
            + Nuevo Producto
          </button>
        </div>

        <div className="space-y-4">
          {productos.length === 0 && !loading && <p className="text-center text-gray-500">No hay productos registrados.</p>}
          {productos.map((producto) => (
            <div key={producto.id} className="border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{producto.nombre_comercial}</h3>
                  <p className="text-sm text-gray-600">SKU: {producto.sku}</p>
                  <p className="text-sm">Laboratorio: {producto.laboratorio_nombre}</p>
                  <p className="text-sm">Categoría: {producto.categoria_nombre}</p>
                  <p className="text-lg font-bold text-green-600 mt-1">Bs. {producto.precio_venta}</p>
                  {producto.inventario && (
                    <div className="mt-1 text-sm">
                      <p>Stock actual: <span className={producto.inventario.stock_actual < producto.stock_minimo ? "text-red-600" : "text-green-600"}>{producto.inventario.stock_actual} unidades</span></p>
                      <p>Disponible: {producto.inventario.stock_disponible} unidades</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(producto)} className="bg-blue-500 text-white px-3 py-1 rounded text-sm">Editar</button>
                  <button onClick={() => handleDelete(producto.id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {showForm && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/50 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Formulario de producto"
          onClick={resetForm}
        >
          <div
            className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-slate-100 bg-[linear-gradient(135deg,rgba(236,253,245,0.92),rgba(240,249,255,0.92))] px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">Inventario</p>
                  <h2 className="text-xl font-black text-slate-900">{editingProduct ? "Editar producto" : "Registrar producto"}</h2>
                  <p className="mt-1 text-sm text-slate-600">Completa los datos principales y de precio para guardar el producto.</p>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                >
                  Cerrar
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">SKU</label>
                  <input type="text" name="sku" placeholder="Ej: PARA-001" value={formData.sku} onChange={handleInputChange} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100" required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Nombre comercial</label>
                  <input type="text" name="nombre_comercial" placeholder="Ej: Paracetamol 500 mg" value={formData.nombre_comercial} onChange={handleInputChange} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100" required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Nombre generico</label>
                  <input type="text" name="nombre_generico" placeholder="Ej: Acetaminofen" value={formData.nombre_generico} onChange={handleInputChange} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Forma farmaceutica</label>
                  <select name="forma_farmaceutica" value={formData.forma_farmaceutica} onChange={handleInputChange} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100">
                    <option value="tableta">Tableta</option>
                    <option value="capsula">Capsula</option>
                    <option value="jarabe">Jarabe</option>
                    <option value="crema">Crema</option>
                    <option value="gotas">Gotas</option>
                    <option value="inyectable">Inyectable</option>
                    <option value="suspension">Suspension</option>
                    <option value="polvo">Polvo</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Categoria</label>
                  <select name="categoria_id" value={formData.categoria_id} onChange={handleInputChange} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100" required>
                    <option value="">Selecciona categoria</option>
                    {categorias.map((cat) => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Laboratorio</label>
                  <select name="laboratorio_id" value={formData.laboratorio_id} onChange={handleInputChange} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100" required>
                    <option value="">Selecciona laboratorio</option>
                    {laboratorios.map((lab) => <option key={lab.id} value={lab.id}>{lab.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Concentracion</label>
                  <input type="text" name="concentracion" placeholder="Ej: 500 mg" value={formData.concentracion} onChange={handleInputChange} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Presentacion</label>
                  <input type="text" name="presentacion" placeholder="Ej: Caja x 20" value={formData.presentacion} onChange={handleInputChange} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Unidad de medida</label>
                  <select name="unidad_medida" value={formData.unidad_medida} onChange={handleInputChange} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100">
                    <option value="unidad">Unidad</option>
                    <option value="caja">Caja</option>
                    <option value="frasco">Frasco</option>
                    <option value="blister">Blister</option>
                    <option value="ampolla">Ampolla</option>
                    <option value="sobre">Sobre</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Precio compra (Bs.)</label>
                  <input type="number" step="0.01" min="0" name="precio_compra" placeholder="0.00" value={formData.precio_compra} onChange={handleInputChange} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100" required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Precio venta (Bs.)</label>
                  <input type="number" step="0.01" min="0" name="precio_venta" placeholder="0.00" value={formData.precio_venta} onChange={handleInputChange} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100" required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Stock minimo</label>
                  <input type="number" min="0" name="stock_minimo" placeholder="0" value={formData.stock_minimo} onChange={handleInputChange} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100" required />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Descripcion</label>
                <textarea name="descripcion" placeholder="Describe el producto, uso recomendado o detalles relevantes" value={formData.descripcion} onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100" rows="3" />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                  <input type="checkbox" name="requiere_receta" checked={formData.requiere_receta} onChange={handleInputChange} className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500" />
                  Requiere receta
                </label>
                <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                  <input type="checkbox" name="es_controlado" checked={formData.es_controlado} onChange={handleInputChange} className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500" />
                  Es controlado
                </label>
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={resetForm} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" disabled={saving}>
                  Cancelar
                </button>
                <button type="submit" className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-600 disabled:cursor-not-allowed disabled:bg-slate-400" disabled={saving}>
                  {saving ? "Guardando..." : editingProduct ? "Actualizar producto" : "Crear producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}