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

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const handleEntradaSuccess = () => {
    // Refrescar el historial cuando se registra una entrada exitosa
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <AdminLayout activeSection="inventory" currentUser={user} onLogout={handleLogout}>
      <div className="space-y-6">
        <RegistroEntradaStockForm onSuccess={handleEntradaSuccess} />
        <HistorialEntradasStock refresh={refreshTrigger} />
      </div>
    </AdminLayout>
  );
}
