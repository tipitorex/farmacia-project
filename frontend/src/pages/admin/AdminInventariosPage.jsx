import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import RegistroEntradaStockForm from "../../components/admin/RegistroEntradaStockForm";
import HistorialEntradasStock from "../../components/admin/HistorialEntradasStock";
import { useAuth } from "../../context/AuthContext";
import { productosService } from "../../services/inventarioService";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { SearchIcon } from "../../components/ui/Icons";

function StatusBadge({ estado, label }) {
  const tone =
    estado === "disponible"
      ? "bg-emerald-100 text-emerald-700"
      : estado === "stock_bajo"
      ? "bg-amber-100 text-amber-700"
      : "bg-rose-100 text-rose-700";

  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${tone}`}>{label}</span>;
}

function SummaryCard({ label, value, helper }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </article>
  );
}

export default function AdminInventariosPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout, hasPermission } = useAuth();

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // ── Stock view state ──────────────────────────────────────────────────────
  const [stockItems, setStockItems] = useState([]);
  const [loadingStock, setLoadingStock] = useState(false);
  const [stockError, setStockError] = useState("");
  const [stockSearchInput, setStockSearchInput] = useState("");
  const [stockSearch, setStockSearch] = useState("");
  const [stockStatusFilter, setStockStatusFilter] = useState("");
  const [stockPage, setStockPage] = useState(1);
  const [stockTotalPages, setStockTotalPages] = useState(1);
  const [stockTotalCount, setStockTotalCount] = useState(0);
  const [stockResumen, setStockResumen] = useState(null);
  const [loadingResumen, setLoadingResumen] = useState(false);
  // ─────────────────────────────────────────────────────────────────────────

  const currentView = searchParams.get("view") || "entradas";
  const canViewInventory = hasPermission("inventario.ver");
  const numberFormatter = useMemo(() => new Intl.NumberFormat("es-BO"), []);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const cargarStock = useCallback(async () => {
    try {
      setLoadingStock(true);
      setStockError("");
      const params = { page: stockPage, page_size: 15 };
      if (stockSearch) params.search = stockSearch;
      if (stockStatusFilter) params.stock_estado = stockStatusFilter;
      const data = await productosService.listar(params);
      const items = Array.isArray(data) ? data : data.results || [];
      setStockItems(items);
      const total = Array.isArray(data) ? items.length : data.count || items.length;
      setStockTotalCount(total);
      setStockTotalPages(Array.isArray(data) ? 1 : Math.max(1, Math.ceil(total / 15)));
    } catch (error) {
      console.error("Error cargando stock:", error);
      setStockError("No se pudo cargar el stock de inventario.");
      setStockItems([]);
    } finally {
      setLoadingStock(false);
    }
  }, [stockPage, stockSearch, stockStatusFilter]);

  const cargarResumen = useCallback(async () => {
    try {
      setLoadingResumen(true);
      const data = await productosService.resumenStock();
      setStockResumen(data);
    } catch (error) {
      console.error("Error cargando resumen:", error);
    } finally {
      setLoadingResumen(false);
    }
  }, []);

  const handleEntradaSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    if (currentView === "stock") {
      cargarStock();
      cargarResumen();
    }
  };

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setStockSearch(stockSearchInput.trim());
      setStockPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [stockSearchInput]);

  // Reset page when status filter changes
  useEffect(() => {
    setStockPage(1);
  }, [stockStatusFilter]);

  // Reload table when search/filter/page changes
  useEffect(() => {
    if (currentView === "stock") cargarStock();
  }, [currentView, stockSearch, stockStatusFilter, stockPage]);

  // Load resumen only once per stock view visit
  useEffect(() => {
    if (currentView === "stock") cargarResumen();
  }, [currentView]);

  const normalizedInventoryItems = useMemo(() => {
    return stockItems.map((item) => {
      const stockActual = Number(item?.inventario?.stock_actual ?? 0);
      const stockMinimo = Number(item?.stock_minimo ?? 0);
      const estado = stockActual <= 0 ? "sin_stock" : stockActual <= stockMinimo ? "stock_bajo" : "disponible";
      const estadoLabel = estado === "sin_stock" ? "Sin stock" : estado === "stock_bajo" ? "Stock bajo" : "Disponible";
      return {
        id: item.id,
        nombre: item.nombre_comercial || "Producto sin nombre",
        sku: item.sku || "-",
        categoria: item.categoria_nombre || "Sin categoría",
        stock_actual: stockActual,
        stock_minimo: stockMinimo,
        estado,
        estado_label: estadoLabel,
        updated_at: item.updated_at || null,
      };
    });
  }, [stockItems]);

  const hasInventoryFilters = stockSearchInput.trim() !== "" || stockStatusFilter !== "";

  if (!canViewInventory) {
    return (
      <AdminLayout activeSection="inventory" currentUser={user} onLogout={handleLogout}>
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-md">
          <h1 className="text-2xl font-black text-slate-900">Admin / Inventarios</h1>
          <p className="mt-2 text-sm text-rose-600">No tienes permisos para ver esta seccion.</p>
        </section>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeSection="inventory" currentUser={user} onLogout={handleLogout}>
      <div className="space-y-6">
        {currentView === "entradas" ? (
          <section className="space-y-8">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-md">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Entrada de inventario</h1>
                <p className="mt-1 text-sm text-slate-600">Registra nuevas unidades y consulta el historial.</p>
              </div>
            </div>

            {/* Formulario */}
            <div>
              <RegistroEntradaStockForm onSuccess={() => setRefreshTrigger((prev) => prev + 1)} compact={false} />
            </div>

            {/* Historial */}
            <div>
              <HistorialEntradasStock refresh={refreshTrigger} />
            </div>
          </section>
        ) : null}

        {currentView === "stock" ? (
          <section className="space-y-4">
            <section className="rounded-[28px] border border-slate-200 bg-white/97 p-4 shadow-md sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Inventarios</p>
                  <h2 className="text-2xl font-black text-slate-900">Stock disponible</h2>
                  <p className="mt-2 max-w-2xl text-sm text-slate-600">
                    Consulta existencias por producto para conocer disponibilidad, stock bajo y productos sin unidades.
                  </p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => { cargarStock(); cargarResumen(); }} disabled={loadingStock}>
                  {loadingStock ? "Actualizando..." : "Actualizar"}
                </Button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                  label="Total productos"
                  value={loadingResumen ? "–" : numberFormatter.format(stockResumen?.total_productos ?? 0)}
                  helper="Productos activos en catálogo"
                />
                <SummaryCard
                  label="Unidades en stock"
                  value={loadingResumen ? "–" : numberFormatter.format(stockResumen?.stock_total_unidades ?? 0)}
                  helper="Suma total del inventario"
                />
                <SummaryCard
                  label="Stock bajo"
                  value={loadingResumen ? "–" : numberFormatter.format(stockResumen?.stock_bajo ?? 0)}
                  helper="Por debajo del mínimo"
                />
                <SummaryCard
                  label="Sin stock"
                  value={loadingResumen ? "–" : numberFormatter.format(stockResumen?.sin_stock ?? 0)}
                  helper="Productos agotados"
                />
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white/97 p-4 shadow-md sm:p-5">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[240px] flex-1">
                  <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={stockSearchInput}
                    onChange={(event) => setStockSearchInput(event.target.value)}
                    placeholder="Buscar por SKU, nombre o categoría"
                    className="pl-9"
                    aria-label="Buscar inventario"
                  />
                </div>

                <select
                  value={stockStatusFilter}
                  onChange={(event) => setStockStatusFilter(event.target.value)}
                  className="h-11 min-w-[180px] rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  aria-label="Filtrar por estado de stock"
                >
                  <option value="">Todos los estados</option>
                  <option value="disponible">Disponible</option>
                  <option value="stock_bajo">Stock bajo</option>
                  <option value="sin_stock">Sin stock</option>
                </select>

                {hasInventoryFilters ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStockSearchInput("");
                      setStockSearch("");
                      setStockStatusFilter("");
                      setStockPage(1);
                    }}
                  >
                    Limpiar filtros
                  </Button>
                ) : null}
              </div>

              {stockError ? (
                <Alert tone="danger" className="mt-4">
                  <AlertDescription>{stockError}</AlertDescription>
                </Alert>
              ) : null}

              <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Producto</th>
                        <th className="px-4 py-3">SKU</th>
                        <th className="px-4 py-3">Categoría</th>
                        <th className="px-4 py-3 text-right">Stock actual</th>
                        <th className="px-4 py-3 text-right">Stock mínimo</th>
                        <th className="px-4 py-3">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {loadingStock ? (
                        <tr>
                          <td colSpan="6" className="px-4 py-10 text-center">
                            <span className="inline-flex items-center gap-2 text-slate-500">
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-600"></span>
                              Cargando inventario...
                            </span>
                          </td>
                        </tr>
                      ) : normalizedInventoryItems.length ? (
                        normalizedInventoryItems.map((item) => (
                          <tr key={item.id} className="transition-colors hover:bg-slate-50/80">
                            <td className="px-4 py-3">
                              <p className="font-semibold text-slate-900">{item.nombre}</p>
                              <p className="text-xs text-slate-500">
                                {item.updated_at ? `Actualizado ${new Date(item.updated_at).toLocaleString()}` : ""}
                              </p>
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-slate-700">{item.sku}</td>
                            <td className="px-4 py-3 text-slate-700">{item.categoria}</td>
                            <td className="px-4 py-3 text-right font-semibold text-slate-900">
                              {numberFormatter.format(item.stock_actual)}
                            </td>
                            <td className="px-4 py-3 text-right text-slate-700">
                              {numberFormatter.format(item.stock_minimo)}
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge estado={item.estado} label={item.estado_label} />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-4 py-10 text-center text-slate-500">
                            {hasInventoryFilters
                              ? "No se encontraron productos con esos filtros."
                              : "No hay productos disponibles en inventario."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Paginación */}
              {stockTotalPages > 1 && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
                  <span className="text-slate-600">
                    {stockTotalCount} resultado{stockTotalCount === 1 ? "" : "s"} · página {stockPage} de {stockTotalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStockPage((p) => Math.max(1, p - 1))}
                      disabled={stockPage <= 1 || loadingStock}
                      className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ← Anterior
                    </button>
                    <button
                      type="button"
                      onClick={() => setStockPage((p) => Math.min(stockTotalPages, p + 1))}
                      disabled={stockPage >= stockTotalPages || loadingStock}
                      className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>
              )}
            </section>
          </section>
        ) : null}
      </div>

    </AdminLayout>
  );
}
