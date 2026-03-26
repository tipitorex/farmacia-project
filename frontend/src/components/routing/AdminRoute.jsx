import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Card, CardContent } from "../ui/card";

export default function AdminRoute() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <main className="farm-bg flex min-h-screen items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-500">Validando sesion...</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
