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
import {
  createAdminUser,
  deleteAdminUser,
  createRole,
  deleteRole,
  listAdminUsers,
  listPermissionsCatalog,
  listRoles,
  updateAdminUser,
  updateRolePermissions,
} from "../services/adminService";

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
  const { user, logout, isAdmin, hasPermission } = useAuth();
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
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [updatingUser, setUpdatingUser] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [createUserForm, setCreateUserForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "cliente",
    is_active: true,
  });
  const [editUserForm, setEditUserForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "cliente",
    is_active: true,
  });
  const [roles, setRoles] = useState([]);
  const [permisosCatalogo, setPermisosCatalogo] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState("");
  const [newRoleName, setNewRoleName] = useState("");
  const [selectedRoleName, setSelectedRoleName] = useState("");
  const [selectedRolePermisos, setSelectedRolePermisos] = useState([]);
  const [savingRole, setSavingRole] = useState(false);
  const [deletingRoleName, setDeletingRoleName] = useState("");



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

  const canViewUsers = hasPermission("usuarios.ver");
  const canManageUsers = hasPermission("usuarios.gestionar");

  const roleOptions = useMemo(() => {
    return roles.map((item) => item.nombre);
  }, [roles]);

  const effectiveRoleOptions = roleOptions.length ? roleOptions : ["cliente", "cajero", "farmaceutico", "admin"];

  const canManageRoles = canManageUsers;

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

  const loadRolesAndPermissions = async () => {
    if (!canManageRoles) return;

    setRolesLoading(true);
    setRolesError("");

    try {
      const [rolesData, permissionsData] = await Promise.all([
        listRoles(undefined),
        listPermissionsCatalog(undefined),
      ]);

      const normalizedRoles = Array.isArray(rolesData) ? rolesData : [];
      const normalizedPermissions = Array.isArray(permissionsData) ? permissionsData : [];

      setRoles(normalizedRoles);
      setPermisosCatalogo(normalizedPermissions);

      const firstRole = normalizedRoles[0]?.nombre || "";
      setSelectedRoleName((prev) => prev || firstRole);
      if (!selectedRoleName && firstRole) {
        const firstRolePerms = normalizedRoles.find((item) => item.nombre === firstRole)?.permisos || [];
        setSelectedRolePermisos(firstRolePerms);
      }
    } catch (errorData) {
      setRolesError(errorData?.detail || "No se pudieron cargar roles y permisos.");
    } finally {
      setRolesLoading(false);
    }
  };

  const handleCreateRole = async (event) => {
    event.preventDefault();
    if (!newRoleName.trim()) return;

    setSavingRole(true);
    setRolesError("");
    try {
      const created = await createRole(undefined, {
        nombre: newRoleName.trim().toLowerCase(),
        permisos: [],
      });
      setRoles((prev) => [...prev, created].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      setNewRoleName("");
      setSelectedRoleName(created.nombre);
      setSelectedRolePermisos(created.permisos || []);
    } catch (errorData) {
      setRolesError(errorData?.detail || "No se pudo crear el rol.");
    } finally {
      setSavingRole(false);
    }
  };

  const handleSaveRolePermissions = async () => {
    if (!selectedRoleName) return;

    setSavingRole(true);
    setRolesError("");
    try {
      const updated = await updateRolePermissions(undefined, selectedRoleName, {
        permisos: selectedRolePermisos,
      });
      setRoles((prev) =>
        prev.map((item) => (item.nombre === updated.nombre ? updated : item)).sort((a, b) => a.nombre.localeCompare(b.nombre))
      );
    } catch (errorData) {
      setRolesError(errorData?.detail || "No se pudieron actualizar permisos del rol.");
    } finally {
      setSavingRole(false);
    }
  };

  const handleDeleteRole = async (roleName) => {
    if (!roleName) return;
    setDeletingRoleName(roleName);
    setRolesError("");
    try {
      await deleteRole(undefined, roleName);
      const nextRoles = roles.filter((item) => item.nombre !== roleName);
      setRoles(nextRoles);
      if (selectedRoleName === roleName) {
        const fallback = nextRoles[0]?.nombre || "";
        setSelectedRoleName(fallback);
        setSelectedRolePermisos(nextRoles.find((item) => item.nombre === fallback)?.permisos || []);
      }
    } catch (errorData) {
      setRolesError(errorData?.detail || "No se pudo eliminar el rol.");
    } finally {
      setDeletingRoleName("");
    }
  };

  useEffect(() => {
    if (activeSection === "users" && canViewUsers) {
      loadUsers(usersPage);
    }
  }, [activeSection, usersPage, usersSearch, usersRoleFilter, usersStatusFilter, canViewUsers]);

  useEffect(() => {
    if ((activeSection === "users" || activeSection === "roles-permisos") && canManageRoles) {
      loadRolesAndPermissions();
    }
  }, [activeSection, canManageRoles]);

  useEffect(() => {
    if (!selectedRoleName) return;
    const selected = roles.find((item) => item.nombre === selectedRoleName);
    setSelectedRolePermisos(selected?.permisos || []);
  }, [selectedRoleName, roles]);

  useEffect(() => {
    if (!effectiveRoleOptions.includes(createUserForm.role)) {
      setCreateUserForm((prev) => ({ ...prev, role: effectiveRoleOptions[0] }));
    }
  }, [effectiveRoleOptions, createUserForm.role]);

  useEffect(() => {
    if (!effectiveRoleOptions.includes(editUserForm.role)) {
      setEditUserForm((prev) => ({ ...prev, role: effectiveRoleOptions[0] }));
    }
  }, [effectiveRoleOptions, editUserForm.role]);

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
        role: "cliente",
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

  const handleOpenEditUserModal = (targetUser) => {
    setSelectedUser(targetUser);
    setEditUserForm({
      first_name: targetUser.first_name || "",
      last_name: targetUser.last_name || "",
      email: targetUser.email || "",
      password: "",
      role: targetUser.role || "cliente",
      is_active: Boolean(targetUser.is_active),
    });
    setShowEditUserModal(true);
  };

  const handleCloseEditUserModal = () => {
    setShowEditUserModal(false);
    setSelectedUser(null);
    setEditUserForm({
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      role: "cliente",
      is_active: true,
    });
  };

  const handleSubmitEditUser = async (event) => {
    event.preventDefault();
    if (!selectedUser?.id) return;

    setUpdatingUser(true);
    setUsersError("");

    const payload = {
      first_name: editUserForm.first_name,
      last_name: editUserForm.last_name,
      email: editUserForm.email,
      role: editUserForm.role,
      is_active: editUserForm.is_active,
    };

    if (editUserForm.password.trim()) {
      payload.password = editUserForm.password;
    }

    try {
      const updated = await updateAdminUser(undefined, selectedUser.id, payload);
      setUsers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      handleCloseEditUserModal();
    } catch (errorData) {
      if (typeof errorData === "object" && errorData !== null) {
        const firstKey = Object.keys(errorData)[0];
        const firstMessage = Array.isArray(errorData[firstKey]) ? errorData[firstKey][0] : errorData[firstKey];
        setUsersError(firstMessage || "No se pudo actualizar el usuario.");
      } else {
        setUsersError("No se pudo actualizar el usuario.");
      }
    } finally {
      setUpdatingUser(false);
    }
  };

  const handleOpenDeleteUserModal = (targetUser) => {
    setSelectedUser(targetUser);
    setShowDeleteUserModal(true);
  };

  const handleCloseDeleteUserModal = () => {
    setShowDeleteUserModal(false);
    setSelectedUser(null);
  };

  const handleConfirmDeleteUser = async () => {
    if (!selectedUser?.id) return;

    setDeletingUser(true);
    setUsersError("");

    try {
      await deleteAdminUser(undefined, selectedUser.id);
      setShowDeleteUserModal(false);
      setSelectedUser(null);

      const nextCount = Math.max(0, usersTotalCount - 1);
      const nextTotalPages = Math.max(1, Math.ceil(nextCount / USERS_PAGE_SIZE));
      const nextPage = Math.min(usersPage, nextTotalPages);
      setUsersTotalCount(nextCount);
      setUsersPage(nextPage);
      await loadUsers(nextPage);
    } catch (errorData) {
      if (typeof errorData === "object" && errorData !== null) {
        const firstKey = Object.keys(errorData)[0];
        const firstMessage = Array.isArray(errorData[firstKey]) ? errorData[firstKey][0] : errorData[firstKey];
        setUsersError(firstMessage || "No se pudo eliminar el usuario.");
      } else {
        setUsersError("No se pudo eliminar el usuario.");
      }
    } finally {
      setDeletingUser(false);
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
              {canManageUsers ? (
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
              {effectiveRoleOptions.map((roleName) => (
                <option key={roleName} value={roleName}>{roleName}</option>
              ))}
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
                    <th scope="col" className="py-2 pr-4">Ultimo acceso</th>
                    <th scope="col" className="py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((item) => {
                    const isReadOnly = !canManageUsers;

                    return (
                      <tr key={item.id} className="border-b border-slate-100 last:border-b-0">
                        <td className="py-3 pr-4 font-semibold text-slate-800">
                          {[item.first_name, item.last_name].filter(Boolean).join(" ").trim() || "(sin nombre)"}
                        </td>
                        <td className="py-3 pr-4 text-slate-700">{item.email || "(sin correo)"}</td>
                        <td className="py-3 pr-4">
                          <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                            {item.role}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${item.is_active ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                          >
                            {item.is_active ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-slate-600">
                          {item.last_login ? new Date(item.last_login).toLocaleString() : "Sin acceso"}
                        </td>
                        <td className="py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleOpenEditUserModal(item)}
                              disabled={isReadOnly}
                            >
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleOpenDeleteUserModal(item)}
                              disabled={isReadOnly}
                              className="bg-rose-600 text-white hover:bg-rose-500"
                            >
                              Eliminar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!users.length ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-sm text-slate-500">
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
                        {effectiveRoleOptions.map((roleName) => (
                          <option key={roleName} value={roleName}>{roleName}</option>
                        ))}
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

          {showEditUserModal ? (
            <div
              className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/50 px-4 py-6 backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
              aria-label="Editar usuario"
            >
              <Card className="w-full max-w-lg overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-[linear-gradient(135deg,rgba(236,253,245,0.92),rgba(240,249,255,0.92))]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">Backoffice</p>
                      <CardTitle>Editar usuario</CardTitle>
                    </div>
                    <button
                      type="button"
                      onClick={handleCloseEditUserModal}
                      aria-label="Cerrar"
                      className="rounded-xl border border-slate-200 bg-white/80 p-2 text-slate-500 transition hover:border-slate-300 hover:bg-white hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                    >
                      <CloseIcon className="h-4 w-4" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-5">
                  <form className="space-y-3" onSubmit={handleSubmitEditUser}>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        type="text"
                        placeholder="Nombre"
                        value={editUserForm.first_name}
                        onChange={(event) => setEditUserForm((prev) => ({ ...prev, first_name: event.target.value }))}
                      />
                      <Input
                        type="text"
                        placeholder="Apellido"
                        value={editUserForm.last_name}
                        onChange={(event) => setEditUserForm((prev) => ({ ...prev, last_name: event.target.value }))}
                      />
                    </div>
                    <Input
                      type="email"
                      placeholder="Correo electronico"
                      value={editUserForm.email}
                      onChange={(event) => setEditUserForm((prev) => ({ ...prev, email: event.target.value }))}
                      required
                    />
                    <Input
                      type="password"
                      placeholder="Nueva contrasena (opcional)"
                      value={editUserForm.password}
                      onChange={(event) => setEditUserForm((prev) => ({ ...prev, password: event.target.value }))}
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <select
                        value={editUserForm.role}
                        onChange={(event) => setEditUserForm((prev) => ({ ...prev, role: event.target.value }))}
                        aria-label="Rol del usuario"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                      >
                        {effectiveRoleOptions.map((roleName) => (
                          <option key={roleName} value={roleName}>{roleName}</option>
                        ))}
                      </select>
                      <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={editUserForm.is_active}
                          onChange={(event) => setEditUserForm((prev) => ({ ...prev, is_active: event.target.checked }))}
                          className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
                        />
                        Activo
                      </label>
                    </div>
                    <Button type="submit" disabled={updatingUser} className="w-full bg-teal-700 hover:bg-teal-600">
                      {updatingUser ? "Guardando cambios..." : "Guardar cambios"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          ) : null}

          {showDeleteUserModal ? (
            <div
              className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/50 px-4 py-6 backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
              aria-label="Eliminar usuario"
            >
              <Card className="w-full max-w-md overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-[linear-gradient(135deg,rgba(255,241,242,0.92),rgba(255,255,255,0.92))]">
                  <CardTitle>Confirmar eliminacion</CardTitle>
                  <CardDescription>
                    Se desactivara la cuenta de {selectedUser?.email || "este usuario"}. Esta accion se puede revertir editando su estado.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-5">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="secondary" onClick={handleCloseDeleteUserModal} disabled={deletingUser}>
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleConfirmDeleteUser}
                      disabled={deletingUser}
                      className="bg-rose-600 text-white hover:bg-rose-500"
                    >
                      {deletingUser ? "Eliminando..." : "Eliminar usuario"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </section>
      ) : null}

      {activeSection !== "overview" && activeSection !== "products" && activeSection !== "users" ? (
        activeSection === "roles-permisos" ? (
          <section className="space-y-4">
            <section className="rounded-[28px] border border-slate-200 bg-white/97 p-4 shadow-md sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Configuracion de roles y permisos</h3>
                  <p className="text-sm text-slate-500">Administra los roles disponibles y sus permisos operativos.</p>
                </div>
                <Button variant="secondary" size="sm" onClick={loadRolesAndPermissions} disabled={rolesLoading || !canManageRoles}>
                  {rolesLoading ? "Actualizando..." : "Actualizar"}
                </Button>
              </div>

              {!canManageRoles ? (
                <Alert tone="danger" className="mb-3">
                  <AlertDescription>No tienes permisos para gestionar roles.</AlertDescription>
                </Alert>
              ) : null}

              {rolesError ? (
                <Alert tone="danger" className="mb-3">
                  <AlertDescription>{rolesError}</AlertDescription>
                </Alert>
              ) : null}

              <form className="mb-4 flex flex-col gap-2 sm:flex-row" onSubmit={handleCreateRole}>
                <Input
                  type="text"
                  value={newRoleName}
                  onChange={(event) => setNewRoleName(event.target.value)}
                  placeholder="Nombre del nuevo rol (ej: supervisor)"
                  aria-label="Nombre del nuevo rol"
                  disabled={!canManageRoles || savingRole}
                />
                <Button type="submit" disabled={!canManageRoles || savingRole || !newRoleName.trim()} className="bg-teal-700 hover:bg-teal-600">
                  Crear rol
                </Button>
              </form>

              <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Roles</p>
                  <div className="space-y-2">
                    {roles.map((roleItem) => {
                      const isActiveRole = roleItem.nombre === selectedRoleName;
                      const isDeleting = deletingRoleName === roleItem.nombre;
                      const canDeleteRole = roleItem.nombre !== "admin";

                      return (
                        <div key={roleItem.nombre} className={`flex items-center gap-2 rounded-xl border px-2 py-2 ${isActiveRole ? "border-teal-600 bg-teal-50" : "border-slate-200 bg-white"}`}>
                          <button
                            type="button"
                            onClick={() => setSelectedRoleName(roleItem.nombre)}
                            className="min-w-0 flex-1 truncate text-left text-sm font-semibold text-slate-800"
                          >
                            {roleItem.nombre}
                          </button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleDeleteRole(roleItem.nombre)}
                            disabled={!canManageRoles || !canDeleteRole || isDeleting}
                          >
                            {isDeleting ? "..." : "Eliminar"}
                          </Button>
                        </div>
                      );
                    })}

                    {!roles.length ? (
                      <p className="text-xs text-slate-500">No hay roles disponibles.</p>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Permisos</p>
                      <h4 className="text-sm font-black text-slate-900">
                        {selectedRoleName ? `Rol: ${selectedRoleName}` : "Selecciona un rol"}
                      </h4>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleSaveRolePermissions}
                      disabled={!canManageRoles || !selectedRoleName || savingRole}
                      className="bg-teal-700 hover:bg-teal-600"
                    >
                      {savingRole ? "Guardando..." : "Guardar permisos"}
                    </Button>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {permisosCatalogo.map((permiso) => {
                      const checked = selectedRolePermisos.includes(permiso.codigo);
                      return (
                        <label
                          key={permiso.codigo}
                          className="inline-flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={!canManageRoles || !selectedRoleName || savingRole}
                            onChange={(event) => {
                              const isChecked = event.target.checked;
                              setSelectedRolePermisos((prev) => {
                                if (isChecked) return [...new Set([...prev, permiso.codigo])].sort();
                                return prev.filter((code) => code !== permiso.codigo);
                              });
                            }}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
                          />
                          <span>
                            <span className="block font-semibold text-slate-800">{permiso.nombre}</span>
                            <span className="block text-xs text-slate-500">{permiso.codigo}</span>
                          </span>
                        </label>
                      );
                    })}
                    {!permisosCatalogo.length ? (
                      <p className="text-sm text-slate-500">No se encontraron permisos en el catalogo.</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>
          </section>
        ) : (
        <section className="rounded-[28px] border border-dashed border-slate-300 bg-white/60 p-8 text-center">
          <h3 className="text-lg font-bold text-slate-700">Modulo en preparacion</h3>
          <p className="mt-2 text-sm text-slate-500">Esta seccion se implementara en la siguiente fase del panel administrativo.</p>
        </section>
        )
      ) : null}
    </AdminLayout>
  );
}
