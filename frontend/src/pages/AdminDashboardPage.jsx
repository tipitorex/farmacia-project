import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../components/admin/AdminLayout";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { CloseIcon } from "../components/ui/Icons";
import { adminProducts, dashboardKpis, recentOrders } from "../data/adminData";
import { useAuth } from "../context/AuthContext";
import { createAdminUser, listAdminUsers, updateAdminUser } from "../services/adminService";

const USERS_PAGE_SIZE = 8;

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
  const { user, logout, isAdmin } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [usersSearch, setUsersSearch] = useState("");
  const [usersRoleFilter, setUsersRoleFilter] = useState("all");
  const [usersStatusFilter, setUsersStatusFilter] = useState("all");
  const [usersTotalCount, setUsersTotalCount] = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [usersPage, setUsersPage] = useState(1);
  const [savingUserId, setSavingUserId] = useState(null);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "customer",
    is_active: true,
  });



  const filteredProducts = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return adminProducts;

    return adminProducts.filter(
      (item) =>
        item.name.toLowerCase().includes(needle) ||
        item.sku.toLowerCase().includes(needle) ||
        item.category.toLowerCase().includes(needle)
    );
  }, [search]);

  const totalUsersPages = useMemo(() => {
    return Math.max(1, Math.ceil(usersTotalCount / USERS_PAGE_SIZE));
  }, [usersTotalCount]);

  const hasUsersFilters = useMemo(() => {
    return Boolean(usersSearch.trim()) || usersRoleFilter !== "all" || usersStatusFilter !== "all";
  }, [usersSearch, usersRoleFilter, usersStatusFilter]);

  const paginationRangeText = useMemo(() => {
    if (!usersTotalCount) return "Mostrando 0 de 0 usuarios";
    const start = (usersPage - 1) * USERS_PAGE_SIZE + 1;
    const end = Math.min(usersPage * USERS_PAGE_SIZE, usersTotalCount);
    return `Mostrando ${start}-${end} de ${usersTotalCount} usuarios`;
  }, [usersPage, usersTotalCount]);

  useEffect(() => {
    setUsersPage(1);
  }, [usersSearch, usersRoleFilter, usersStatusFilter]);

  const loadUsers = async (page = usersPage) => {
    setUsersLoading(true);
    setUsersError("");

    try {
      const data = await listAdminUsers(undefined, {
        page,
        pageSize: USERS_PAGE_SIZE,
        search: usersSearch,
        role: usersRoleFilter,
        status: usersStatusFilter,
      });

      setUsers(Array.isArray(data?.results) ? data.results : []);
      setUsersTotalCount(Number.isInteger(data?.count) ? data.count : 0);

      const backendPage = page;
      const nextTotalPages = Math.max(1, Math.ceil((data?.count || 0) / USERS_PAGE_SIZE));
      setUsersPage(Math.min(backendPage, nextTotalPages));
    } catch (errorData) {
      setUsersError(errorData?.detail || "No se pudo cargar la lista de usuarios.");
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === "users" && isAdmin) {
      loadUsers(usersPage);
    }
  }, [activeSection, usersPage, usersSearch, usersRoleFilter, usersStatusFilter, isAdmin]);

  const handleUserRoleChange = async (targetUser, nextRole) => {
    setSavingUserId(targetUser.id);
    setUsersError("");
    try {
      const updated = await updateAdminUser(undefined, targetUser.id, { role: nextRole });
      setUsers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (errorData) {
      setUsersError(errorData?.detail || "No se pudo actualizar el rol del usuario.");
    } finally {
      setSavingUserId(null);
    }
  };

  const handleUserStatusChange = async (targetUser, nextActive) => {
    setSavingUserId(targetUser.id);
    setUsersError("");
    try {
      const updated = await updateAdminUser(undefined, targetUser.id, { is_active: nextActive });
      setUsers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (errorData) {
      setUsersError(errorData?.detail || "No se pudo actualizar el estado del usuario.");
    } finally {
      setSavingUserId(null);
    }
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setCreatingUser(true);
    setUsersError("");

    try {
      await createAdminUser(undefined, createUserForm);
      setShowCreateUserModal(false);
      setCreateUserForm({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: "customer",
        is_active: true,
      });
      setUsersPage(1);
      await loadUsers(1);
    } catch (errorData) {
      if (typeof errorData === "object" && errorData !== null) {
        const firstKey = Object.keys(errorData)[0];
        const firstMessage = Array.isArray(errorData[firstKey]) ? errorData[firstKey][0] : errorData[firstKey];
        setUsersError(firstMessage || "No se pudo crear el usuario.");
      } else {
        setUsersError("No se pudo crear el usuario.");
      }
    } finally {
      setCreatingUser(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <AdminLayout activeSection={activeSection} setActiveSection={setActiveSection} currentUser={user} onLogout={handleLogout}>
      {activeSection === "overview" ? (
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

          <section className="rounded-[28px] border border-slate-200 bg-white/97 p-4 shadow-md sm:p-5">
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
          </section>
        </section>
      ) : null}

      {activeSection === "products" ? (
          <section className="rounded-[28px] border border-slate-200 bg-white/97 p-4 shadow-md sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-black text-slate-900">Gestion de productos</h3>
            <Button size="sm" className="bg-teal-700 hover:bg-teal-600">
              Nuevo producto
            </Button>
          </div>

          <div className="mb-4">
            <Input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por SKU, nombre o categoria"
              aria-label="Buscar productos"
              className="border-slate-200 bg-slate-50 focus:border-sky-300 focus:ring-sky-100"
            />
          </div>

          <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                  <th scope="col" className="py-2 pr-4">SKU</th>
                  <th scope="col" className="py-2 pr-4">Producto</th>
                  <th scope="col" className="py-2 pr-4">Categoria</th>
                  <th scope="col" className="py-2 pr-4">Stock</th>
                  <th scope="col" className="py-2 pr-4">Precio</th>
                  <th scope="col" className="py-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.sku} className="border-b border-slate-100 last:border-b-0">
                    <td className="py-3 pr-4 font-semibold text-slate-800">{product.sku}</td>
                    <td className="py-3 pr-4 text-slate-700">{product.name}</td>
                    <td className="py-3 pr-4 text-slate-700">{product.category}</td>
                    <td className="py-3 pr-4 text-slate-700">{product.stock}</td>
                    <td className="py-3 pr-4 text-slate-700">{product.price}</td>
                    <td className="py-3">
                      <StatusBadge status={product.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {activeSection === "users" ? (
        <section className="rounded-[28px] border border-slate-200 bg-white/97 p-4 shadow-md sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-black text-slate-900">Gestion de usuarios</h3>
            <div className="flex flex-wrap gap-2">
              {hasUsersFilters ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setUsersSearch("");
                    setUsersRoleFilter("all");
                    setUsersStatusFilter("all");
                    setUsersPage(1);
                  }}
                >
                  Limpiar filtros
                </Button>
              ) : null}
              {user?.role === "admin" ? (
                <Button
                  size="sm"
                  onClick={() => setShowCreateUserModal(true)}
                  className="bg-teal-700 hover:bg-teal-600"
                >
                  Nuevo usuario
                </Button>
              ) : null}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => loadUsers(usersPage)}
              >
                Actualizar lista
              </Button>
            </div>
          </div>

          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <Input
              type="text"
              value={usersSearch}
              onChange={(event) => setUsersSearch(event.target.value)}
              placeholder="Buscar por nombre, correo o rol"
              aria-label="Buscar usuarios"
              className="border-slate-200 bg-slate-50 focus:border-sky-300 focus:ring-sky-100"
            />
            <select
              value={usersRoleFilter}
              onChange={(event) => setUsersRoleFilter(event.target.value)}
              aria-label="Filtrar usuarios por rol"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
            >
              <option value="all">Todos los roles</option>
              <option value="admin">Administrador</option>
              <option value="worker">Trabajador</option>
              <option value="customer">Cliente</option>
            </select>
            <select
              value={usersStatusFilter}
              onChange={(event) => setUsersStatusFilter(event.target.value)}
              aria-label="Filtrar usuarios por estado"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>

          {usersError ? (
            <Alert tone="danger" className="mb-3">
              <AlertDescription>{usersError}</AlertDescription>
            </Alert>
          ) : null}

          {usersLoading ? (
            <p className="text-sm text-slate-600">Cargando usuarios...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                    <th scope="col" className="py-2 pr-4">Nombre completo</th>
                    <th scope="col" className="py-2 pr-4">Correo</th>
                    <th scope="col" className="py-2 pr-4">Rol</th>
                    <th scope="col" className="py-2 pr-4">Estado</th>
                    <th scope="col" className="py-2">Ultimo acceso</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((item) => {
                    const isSaving = savingUserId === item.id;
                    const isReadOnly = user?.role !== "admin";

                    return (
                      <tr key={item.id} className="border-b border-slate-100 last:border-b-0">
                        <td className="py-3 pr-4 font-semibold text-slate-800">
                          {[item.first_name, item.last_name].filter(Boolean).join(" ").trim() || "(sin nombre)"}
                        </td>
                        <td className="py-3 pr-4 text-slate-700">{item.email || "(sin correo)"}</td>
                        <td className="py-3 pr-4">
                          <select
                            value={item.role}
                            disabled={isReadOnly || isSaving}
                            onChange={(event) => handleUserRoleChange(item, event.target.value)}
                            aria-label={`Rol de usuario ${item.email || item.id}`}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-sky-300 disabled:bg-slate-100"
                          >
                            <option value="customer">Cliente</option>
                            <option value="worker">Trabajador</option>
                            <option value="admin">Administrador</option>
                          </select>
                        </td>
                        <td className="py-3 pr-4">
                          <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
                            <input
                              type="checkbox"
                              checked={Boolean(item.is_active)}
                              disabled={isReadOnly || isSaving}
                              onChange={(event) => handleUserStatusChange(item, event.target.checked)}
                              className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500 disabled:cursor-not-allowed"
                            />
                            {item.is_active ? "Activo" : "Inactivo"}
                          </label>
                        </td>
                        <td className="py-3 text-slate-600">
                          {item.last_login ? new Date(item.last_login).toLocaleString() : "Sin acceso"}
                        </td>
                      </tr>
                    );
                  })}
                  {!users.length ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-sm text-slate-500">
                        {hasUsersFilters
                          ? "No hay usuarios para los filtros actuales. Usa 'Limpiar filtros'."
                          : "No hay usuarios para mostrar."}
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}

          {!usersLoading ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-xs font-semibold text-slate-600">
                {paginationRangeText}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setUsersPage((prev) => Math.max(1, prev - 1))}
                  disabled={usersPage <= 1}
                >
                  Anterior
                </Button>
                <span className="text-xs font-bold text-slate-700">
                  Pagina {usersPage} de {totalUsersPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setUsersPage((prev) => Math.min(totalUsersPages, prev + 1))}
                  disabled={usersPage >= totalUsersPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          ) : null}

          {showCreateUserModal ? (
            <div
              className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/50 px-4 py-6 backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
              aria-label="Crear nuevo usuario"
            >
              <Card className="w-full max-w-lg overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-[linear-gradient(135deg,rgba(236,253,245,0.92),rgba(240,249,255,0.92))]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">Backoffice</p>
                      <CardTitle>Crear nuevo usuario</CardTitle>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCreateUserModal(false)}
                      aria-label="Cerrar"
                      className="rounded-xl border border-slate-200 bg-white/80 p-2 text-slate-500 transition hover:border-slate-300 hover:bg-white hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                    >
                      <CloseIcon className="h-4 w-4" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-5">
                  <form className="space-y-3" onSubmit={handleCreateUser}>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        type="text"
                        placeholder="Nombre"
                        value={createUserForm.first_name}
                        onChange={(event) => setCreateUserForm((prev) => ({ ...prev, first_name: event.target.value }))}
                      />
                      <Input
                        type="text"
                        placeholder="Apellido"
                        value={createUserForm.last_name}
                        onChange={(event) => setCreateUserForm((prev) => ({ ...prev, last_name: event.target.value }))}
                      />
                    </div>
                    <Input
                      type="email"
                      placeholder="Correo electronico"
                      value={createUserForm.email}
                      onChange={(event) => setCreateUserForm((prev) => ({ ...prev, email: event.target.value }))}
                    />
                    <Input
                      type="password"
                      placeholder="Contrasena"
                      value={createUserForm.password}
                      onChange={(event) => setCreateUserForm((prev) => ({ ...prev, password: event.target.value }))}
                      required
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <select
                        value={createUserForm.role}
                        onChange={(event) => setCreateUserForm((prev) => ({ ...prev, role: event.target.value }))}
                        aria-label="Rol del nuevo usuario"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                      >
                        <option value="customer">Cliente</option>
                        <option value="worker">Trabajador</option>
                        <option value="admin">Administrador</option>
                      </select>
                      <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={createUserForm.is_active}
                          onChange={(event) => setCreateUserForm((prev) => ({ ...prev, is_active: event.target.checked }))}
                          className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
                        />
                        Activo
                      </label>
                    </div>
                    <Button type="submit" disabled={creatingUser} className="w-full bg-teal-700 hover:bg-teal-600">
                      {creatingUser ? "Creando usuario..." : "Crear usuario"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </section>
      ) : null}

      {activeSection !== "overview" && activeSection !== "products" && activeSection !== "users" ? (
        <section className="rounded-[28px] border border-dashed border-slate-300 bg-white/60 p-8 text-center">
          <h3 className="text-lg font-bold text-slate-700">Modulo en preparacion</h3>
          <p className="mt-2 text-sm text-slate-500">Esta seccion se implementara en la siguiente fase del panel administrativo.</p>
        </section>
      ) : null}
    </AdminLayout>
  );
}
