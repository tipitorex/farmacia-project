import { useEffect, useMemo, useState } from "react";
import {
  categoriasService,
  crearEntradaStock,
  obtenerProductos,
  subcategoriasService,
} from "../../services/inventarioService";

export default function RegistroEntradaStockForm({ onSuccess, isLoading = false, compact = false, onCancel }) {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [productoSearchInput, setProductoSearchInput] = useState("");
  const [productoSearch, setProductoSearch] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("");
  const [subcategoriaFilter, setSubcategoriaFilter] = useState("");
  const [productsPage, setProductsPage] = useState(1);
  const [productsTotalPages, setProductsTotalPages] = useState(1);
  const [productsTotalCount, setProductsTotalCount] = useState(0);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedProductInfo, setSelectedProductInfo] = useState(null);
  const [formData, setFormData] = useState({
    producto: "",
    cantidad: "",
    motivo: "reposicion",
    descripcion: "",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const MOTIVOS = [
    { value: "reposicion", label: "Reposición Proveedor" },
    { value: "devolucion", label: "Devolución de Cliente" },
    { value: "ajuste", label: "Ajuste de Inventario" },
    { value: "correccion", label: "Corrección de Conteo" },
    { value: "otro", label: "Otro" },
  ];

  useEffect(() => {
    cargarCategorias();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProductoSearch(productoSearchInput.trim());
      setProductsPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [productoSearchInput]);

  useEffect(() => {
    setSubcategoriaFilter("");
    setProductsPage(1);
  }, [categoriaFilter]);

  useEffect(() => {
    cargarSubcategorias(categoriaFilter);
  }, [categoriaFilter]);

  useEffect(() => {
    cargarProductos();
  }, [productoSearch, categoriaFilter, subcategoriaFilter, productsPage]);

  const cargarCategorias = async () => {
    try {
      setLoadingCategories(true);
      const data = await categoriasService.listar({ estado: true, ordering: "nombre" });
      setCategorias(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error("Error cargando categorias:", error);
      setErrors((prev) => ({
        ...prev,
        general: "Error al cargar categorias. Intenta nuevamente.",
      }));
    } finally {
      setLoadingCategories(false);
    }
  };

  const cargarSubcategorias = async (categoriaId) => {
    if (!categoriaId) {
      setSubcategorias([]);
      return;
    }

    try {
      setLoadingSubcategories(true);
      const data = await subcategoriasService.listar({ categoria: categoriaId });
      setSubcategorias(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error("Error cargando subcategorias:", error);
      setSubcategorias([]);
    } finally {
      setLoadingSubcategories(false);
    }
  };

  const cargarProductos = async () => {
    try {
      setLoadingProducts(true);

      const params = {
        page: productsPage,
        page_size: 10,
      };

      if (productoSearch) {
        params.search = productoSearch;
      }

      if (categoriaFilter) {
        params.categoria = categoriaFilter;
      }

      if (subcategoriaFilter) {
        params.subcategoria = subcategoriaFilter;
      }

      const data = await obtenerProductos(params);
      const pagedProducts = Array.isArray(data) ? data : data.results || [];

      setProductos(pagedProducts);
      setProductsTotalCount(Array.isArray(data) ? pagedProducts.length : data.count || pagedProducts.length);

      const totalPages = Array.isArray(data)
        ? 1
        : Math.max(1, Math.ceil((data.count || pagedProducts.length) / 10));

      setProductsTotalPages(totalPages);

      setErrors((prev) => ({
        ...prev,
        general: prev.general === "Error al cargar los productos. Intenta nuevamente." ? "" : prev.general,
      }));
    } catch (error) {
      console.error("Error cargando productos:", error);
      setErrors((prev) => ({
        ...prev,
        general: "Error al cargar los productos. Intenta nuevamente.",
      }));
      setProductos([]);
      setProductsTotalPages(1);
      setProductsTotalCount(0);
    } finally {
      setLoadingProducts(false);
    }
  };

  const selectedProduct = useMemo(() => {
    if (!formData.producto) return null;
    const fromCurrentPage = productos.find((producto) => String(producto.id) === String(formData.producto));
    return fromCurrentPage || selectedProductInfo;
  }, [productos, formData.producto, selectedProductInfo]);

  const handleProductSelect = (producto) => {
    setFormData((prev) => ({
      ...prev,
      producto: String(producto.id),
    }));
    setSelectedProductInfo(producto);

    if (errors.producto) {
      setErrors((prev) => ({
        ...prev,
        producto: "",
      }));
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
      setSubmitting(true);
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
      setSelectedProductInfo(null);

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
      setSubmitting(false);
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
        <fieldset disabled={submitting || isLoading} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 transition-all sm:p-4">
          <legend className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Buscar producto</legend>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2 lg:col-span-1">
              <label htmlFor="producto_search" className="mb-1 block text-xs font-semibold text-slate-700">
                Nombre, SKU o genérico
              </label>
              <input
                type="text"
                id="producto_search"
                value={productoSearchInput}
                onChange={(event) => setProductoSearchInput(event.target.value)}
                placeholder="Ej: Ibuprofeno o SKU-001"
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
              />
            </div>

            <div>
              <label htmlFor="categoria_filter" className="mb-1 block text-xs font-semibold text-slate-700">
                Categoría {loadingCategories && <span className="text-[10px] text-slate-500">(cargando...)</span>}
              </label>
              <select
                id="categoria_filter"
                value={categoriaFilter}
                onChange={(event) => setCategoriaFilter(event.target.value)}
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
              >
                <option value="">Todas</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="subcategoria_filter" className="mb-1 block text-xs font-semibold text-slate-700">
                Subcategoría {loadingSubcategories && <span className="text-[10px] text-slate-500">(cargando...)</span>}
              </label>
              <select
                id="subcategoria_filter"
                value={subcategoriaFilter}
                onChange={(event) => setSubcategoriaFilter(event.target.value)}
                disabled={!categoriaFilter}
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-teal-400 focus:ring-4 focus:ring-teal-100 disabled:bg-slate-100 disabled:text-slate-500"
              >
                <option value="">Todas</option>
                {subcategorias.map((subcategoria) => (
                  <option key={subcategoria.id} value={subcategoria.id}>
                    {subcategoria.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-medium text-slate-600">
              {loadingProducts ? (
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-teal-600"></span>
                  Buscando...
                </span>
              ) : (
                <>
                  {productsTotalCount === 0 ? "Sin resultados" : `${productsTotalCount} resultado${productsTotalCount === 1 ? "" : "s"}`}
                </>
              )}
            </span>
            {productsTotalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setProductsPage((prev) => Math.max(1, prev - 1))}
                  disabled={productsPage <= 1 || loadingProducts}
                  className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Anterior
                </button>
                <span className="text-xs font-semibold text-slate-600">
                  {productsPage} / {productsTotalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setProductsPage((prev) => Math.min(productsTotalPages, prev + 1))}
                  disabled={productsPage >= productsTotalPages || loadingProducts}
                  className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        </fieldset>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Producto</label>
          <div
            className={`overflow-hidden rounded-xl border transition-colors ${
              errors.producto ? "border-red-500" : "border-slate-300"
            } bg-white`}
          >
            <div className="max-h-64 overflow-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="sticky top-0 z-10 bg-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Producto</th>
                    <th className="px-3 py-2">SKU</th>
                    <th className="px-3 py-2">Categoría</th>
                    <th className="px-3 py-2 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingProducts ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-5">
                        <div className="flex items-center justify-center gap-2 text-slate-500">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-teal-600"></div>
                          Cargando productos...
                        </div>
                      </td>
                    </tr>
                  ) : productos.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-sm text-slate-500">
                        No se encontraron productos con esos filtros.
                      </td>
                    </tr>
                  ) : (
                    productos.map((producto) => {
                      const isSelected = String(formData.producto) === String(producto.id);

                      return (
                        <tr
                          key={producto.id}
                          className={`transition-colors ${
                            isSelected ? "bg-teal-50" : "hover:bg-slate-50"
                          }`}
                        >
                          <td className="px-3 py-2.5">
                            <p className="font-semibold text-slate-800">{producto.nombre_comercial || producto.nombre}</p>
                            <p className="text-xs text-slate-500">{producto.nombre_generico || ""}</p>
                          </td>
                          <td className="px-3 py-2.5 font-mono text-xs text-slate-600">{producto.sku || "-"}</td>
                          <td className="px-3 py-2.5 text-xs text-slate-600">
                            <span>{producto.categoria_nombre || "Sin categoría"}</span>
                            {producto.subcategoria_nombre && (
                              <span className="ml-1 inline-block rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                                {producto.subcategoria_nombre}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleProductSelect(producto)}
                              disabled={submitting || isLoading}
                              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                                isSelected
                                  ? "bg-teal-700 text-white shadow-sm"
                                  : "border border-slate-300 text-slate-700 hover:border-teal-400 hover:bg-teal-50"
                              } disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                              {isSelected ? "✓ Elegido" : "Elegir"}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {errors.producto && <p className="mt-1 text-xs text-red-600 font-medium">{errors.producto}</p>}

          {selectedProduct && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50/80 px-3 py-2.5 text-xs">
              <span className="font-semibold text-teal-900">✓ Producto seleccionado:</span>
              <span className="text-slate-700">{selectedProduct.nombre_comercial || selectedProduct.nombre}</span>
              {selectedProduct.sku && (
                <span className="ml-auto inline-block rounded bg-teal-100 px-2 py-0.5 font-mono text-[10px] text-teal-800">
                  {selectedProduct.sku}
                </span>
              )}
            </div>
          )}
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
            disabled={submitting || isLoading}
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
            disabled={submitting || isLoading}
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
            disabled={submitting || isLoading}
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
              disabled={submitting || isLoading}
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={submitting || isLoading}
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-600 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {submitting || isLoading ? "Registrando..." : "Registrar entrada"}
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
