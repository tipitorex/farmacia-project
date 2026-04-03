import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { useAuth } from "../../context/AuthContext";

export default function AdminProductosPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <AdminLayout activeSection="products" currentUser={user} onLogout={handleLogout}>
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-md">
        <h1 className="text-2xl font-black text-slate-900">Admin / Productos</h1>
        <p className="mt-2 text-sm text-slate-600">
          Pagina base lista. En el siguiente paso moveremos aqui la gestion del catalogo.
        </p>
      </section>
    </AdminLayout>
  );
}
