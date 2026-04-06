import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import RegistroEntradaStockForm from "../../components/admin/RegistroEntradaStockForm";
import HistorialEntradasStock from "../../components/admin/HistorialEntradasStock";
import { useAuth } from "../../context/AuthContext";

export default function AdminInventariosPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showEntradaModal, setShowEntradaModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const handleEntradaSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    setShowEntradaModal(false);
  };

  return (
    <AdminLayout activeSection="inventory" currentUser={user} onLogout={handleLogout}>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Admin / Inventarios</h1>
              <p className="mt-1 text-sm text-slate-600">Gestiona entradas de stock y revisa su historial.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowEntradaModal(true)}
              className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-600"
            >
              + Registrar entrada
            </button>
          </div>
        </section>

        <HistorialEntradasStock refresh={refreshTrigger} />
      </div>

      {showEntradaModal && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/50 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Registrar entrada de stock"
          onClick={() => setShowEntradaModal(false)}
        >
          <div
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-slate-100 bg-[linear-gradient(135deg,rgba(236,253,245,0.92),rgba(240,249,255,0.92))] px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">Inventario</p>
                  <h2 className="text-xl font-black text-slate-900">Registrar entrada de stock</h2>
                  <p className="mt-1 text-sm text-slate-600">Suma unidades al inventario cuando llega nueva mercaderia.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEntradaModal(false)}
                  className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                >
                  Cerrar
                </button>
              </div>
            </div>
            <div className="p-6">
              <RegistroEntradaStockForm
                onSuccess={handleEntradaSuccess}
                compact
                onCancel={() => setShowEntradaModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
