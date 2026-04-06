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

    // Construir payload con los tipos correctos
    const payload = {
      sku: formData.sku,
      nombre_comercial: formData.nombre_comercial,
      nombre_generico: formData.nombre_generico,
      descripcion: formData.descripcion,
      categoria_id: parseInt(formData.categoria_id, 10),
      laboratorio_id: parseInt(formData.laboratorio_id, 10),
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
    }
  };

  const handleEdit = (producto) => {
    setEditingProduct(producto);
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
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showForm ? "Cancelar" : "+ Nuevo Producto"}
          </button>
        </div>

        {showForm && (
          <div className="border rounded-lg p-4 mb-6 bg-gray-50">
            <h2 className="text-xl font-semibold mb-4">{editingProduct ? "Editar Producto" : "Nuevo Producto"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="sku" placeholder="SKU" value={formData.sku} onChange={handleInputChange} className="border p-2 rounded" required />
                <input type="text" name="nombre_comercial" placeholder="Nombre comercial" value={formData.nombre_comercial} onChange={handleInputChange} className="border p-2 rounded" required />
                <input type="text" name="nombre_generico" placeholder="Nombre genérico" value={formData.nombre_generico} onChange={handleInputChange} className="border p-2 rounded" />
                <select name="categoria_id" value={formData.categoria_id} onChange={handleInputChange} className="border p-2 rounded" required>
                  <option value="">Seleccione categoría</option>
                  {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                </select>
                <select name="laboratorio_id" value={formData.laboratorio_id} onChange={handleInputChange} className="border p-2 rounded" required>
                  <option value="">Seleccione laboratorio</option>
                  {laboratorios.map(lab => <option key={lab.id} value={lab.id}>{lab.nombre}</option>)}
                </select>
                <select name="forma_farmaceutica" value={formData.forma_farmaceutica} onChange={handleInputChange} className="border p-2 rounded">
                  <option value="tableta">Tableta</option>
                  <option value="capsula">Cápsula</option>
                  <option value="jarabe">Jarabe</option>
                  <option value="crema">Crema</option>
                  <option value="gotas">Gotas</option>
                  <option value="inyectable">Inyectable</option>
                </select>
                <input type="text" name="concentracion" placeholder="Concentración (ej: 500 mg)" value={formData.concentracion} onChange={handleInputChange} className="border p-2 rounded" />
                <input type="text" name="presentacion" placeholder="Presentación (ej: caja x 10)" value={formData.presentacion} onChange={handleInputChange} className="border p-2 rounded" />
                <select name="unidad_medida" value={formData.unidad_medida} onChange={handleInputChange} className="border p-2 rounded">
                  <option value="unidad">Unidad</option>
                  <option value="caja">Caja</option>
                  <option value="frasco">Frasco</option>
                  <option value="blister">Blíster</option>
                </select>
                <input type="number" step="0.01" name="precio_compra" placeholder="Precio compra" value={formData.precio_compra} onChange={handleInputChange} className="border p-2 rounded" />
                <input type="number" step="0.01" name="precio_venta" placeholder="Precio venta" value={formData.precio_venta} onChange={handleInputChange} className="border p-2 rounded" />
                <input type="number" name="stock_minimo" placeholder="Stock mínimo" value={formData.stock_minimo} onChange={handleInputChange} className="border p-2 rounded" />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="requiere_receta" checked={formData.requiere_receta} onChange={handleInputChange} />
                  Requiere receta
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="es_controlado" checked={formData.es_controlado} onChange={handleInputChange} />
                  Es controlado
                </label>
              </div>
              <textarea name="descripcion" placeholder="Descripción" value={formData.descripcion} onChange={handleInputChange} className="border p-2 rounded w-full" rows="3" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={resetForm} className="bg-gray-300 text-gray-800 px-4 py-2 rounded">Cancelar</button>
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">{editingProduct ? "Actualizar" : "Crear"}</button>
              </div>
            </form>
          </div>
        )}

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
    </AdminLayout>
  );
}