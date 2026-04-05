import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { SearchIcon } from "../../components/ui/Icons";
import { useAuth } from "../../context/AuthContext";
import useAdminInventoryStock from "../../hooks/useAdminInventoryStock";

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
  const { user, logout, hasPermission } = useAuth();
  const canViewInventory = hasPermission("inventario.ver");

  const {
    inventoryItems,
    inventorySummary,
    inventorySearch,
    setInventorySearch,
    inventoryStatusFilter,
    setInventoryStatusFilter,
    inventoryLoading,
    inventoryError,
    hasInventoryFilters,
    loadInventory,
  } = useAdminInventoryStock({ canViewInventory });

  const numberFormatter = new Intl.NumberFormat("es-BO");

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

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
      <section className="space-y-4">
        <section className="rounded-[28px] border border-slate-200 bg-white/97 p-4 shadow-md sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Inventarios</p>
              <h1 className="text-2xl font-black text-slate-900">Stock disponible</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Consulta existencias por producto para conocer disponibilidad, stock bajo y productos sin unidades.
              </p>
            </div>

            <Button variant="secondary" size="sm" onClick={loadInventory} disabled={inventoryLoading}>
              {inventoryLoading ? "Actualizando..." : "Actualizar stock"}
            </Button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Productos visibles"
              value={numberFormatter.format(inventorySummary.total_productos)}
              helper="Resultados segun los filtros actuales"
            />
            <SummaryCard
              label="Unidades en stock"
              value={numberFormatter.format(inventorySummary.stock_total_unidades)}
              helper="Suma total del stock consultado"
            />
            <SummaryCard
              label="Stock bajo"
              value={numberFormatter.format(inventorySummary.productos_stock_bajo)}
              helper="Productos por debajo o en el minimo"
            />
            <SummaryCard
              label="Sin stock"
              value={numberFormatter.format(inventorySummary.productos_sin_stock)}
              helper="Productos agotados actualmente"
            />
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white/97 p-4 shadow-md sm:p-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px] flex-1">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={inventorySearch}
                onChange={(event) => setInventorySearch(event.target.value)}
                placeholder="Buscar por SKU, nombre o categoria"
                className="pl-9"
                aria-label="Buscar inventario"
              />
            </div>

            <select
              value={inventoryStatusFilter}
              onChange={(event) => setInventoryStatusFilter(event.target.value)}
              className="h-11 min-w-[180px] rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
              aria-label="Filtrar stock por estado"
            >
              <option value="all">Todos los estados</option>
              <option value="disponible">Disponible</option>
              <option value="stock_bajo">Stock bajo</option>
              <option value="sin_stock">Sin stock</option>
            </select>

            {hasInventoryFilters ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setInventorySearch("");
                  setInventoryStatusFilter("all");
                }}
              >
                Limpiar filtros
              </Button>
            ) : null}
          </div>

          {inventoryError ? (
            <Alert tone="danger" className="mt-4">
              <AlertDescription>{inventoryError}</AlertDescription>
            </Alert>
          ) : null}

          <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Categoria</th>
                    <th className="px-4 py-3 text-right">Stock actual</th>
                    <th className="px-4 py-3 text-right">Stock minimo</th>
                    <th className="px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {inventoryLoading ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-10 text-center text-slate-500">
                        Cargando inventario...
                      </td>
                    </tr>
                  ) : inventoryItems.length ? (
                    inventoryItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold text-slate-900">{item.nombre}</p>
                            <p className="text-xs text-slate-500">Actualizado {new Date(item.updated_at).toLocaleString()}</p>
                          </div>
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
                          ? "No se encontraron productos para los filtros aplicados."
                          : "No hay productos disponibles en inventario."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </section>
    </AdminLayout>
  );
}
