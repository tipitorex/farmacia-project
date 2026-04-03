import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/admin/AdminLayout";
import { Card, CardContent } from "../components/ui/card";
import { dashboardKpis, recentOrders } from "../data/adminData";
import { useAuth } from "../context/AuthContext";

function StatusBadge({ status }) {
  const tone =
    status === "Activo" || status === "Entregado"
      ? "bg-emerald-100 text-emerald-700"
      : status === "Stock bajo" || status === "Pendiente" || status === "Preparando"
      ? "bg-amber-100 text-amber-700"
      : status === "Sin stock"
      ? "bg-rose-100 text-rose-700"
      : "bg-sky-100 text-sky-700";

  return <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${tone}`}>{status}</span>;
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <AdminLayout activeSection="overview" currentUser={user} onLogout={handleLogout}>
      <section className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardKpis.map((kpi) => (
            <article key={kpi.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{kpi.label}</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{kpi.value}</p>
              <p className="mt-1 text-xs font-semibold text-teal-700">{kpi.trend}</p>
            </article>
          ))}
        </div>

        <Card className="rounded-[28px] border border-slate-200 bg-white/97 shadow-md">
          <CardContent className="p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">Pedidos recientes</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                    <th scope="col" className="py-2 pr-4">Pedido</th>
                    <th scope="col" className="py-2 pr-4">Cliente</th>
                    <th scope="col" className="py-2 pr-4">Total</th>
                    <th scope="col" className="py-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-100 last:border-b-0">
                      <td className="py-3 pr-4 font-semibold text-slate-800">{order.id}</td>
                      <td className="py-3 pr-4 text-slate-700">{order.customer}</td>
                      <td className="py-3 pr-4 text-slate-700">{order.total}</td>
                      <td className="py-3">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    </AdminLayout>
  );
}
