import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { Alert, AlertDescription } from "../../components/ui/alert";
import PermissionsPanel from "../../components/admin/roles/PermissionsPanel";
import RolesHeader from "../../components/admin/roles/RolesHeader";
import RolesList from "../../components/admin/roles/RolesList";
import { useAuth } from "../../context/AuthContext";
import useAdminRolesPermissions from "../../hooks/useAdminRolesPermissions";

export default function AdminRolesPermisosPage() {
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuth();
  const canManageRoles = hasPermission("usuarios.gestionar");

  const {
    roles,
    permisosCatalogo,
    rolesLoading,
    rolesError,
    newRoleName,
    setNewRoleName,
    selectedRoleName,
    setSelectedRoleName,
    selectedRolePermisos,
    setSelectedRolePermisos,
    savingRole,
    deletingRoleName,
    loadRolesAndPermissions,
    handleCreateRole,
    handleSaveRolePermissions,
    handleDeleteRole,
  } = useAdminRolesPermissions({ canManageRoles });

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  if (!canManageRoles) {
    return (
      <AdminLayout activeSection="roles-permisos" currentUser={user} onLogout={handleLogout}>
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-md">
          <h1 className="text-2xl font-black text-slate-900">Admin / Roles y permisos</h1>
          <p className="mt-2 text-sm text-rose-600">No tienes permisos para gestionar esta seccion.</p>
        </section>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeSection="roles-permisos" currentUser={user} onLogout={handleLogout}>
      <section className="space-y-4">
        <section className="rounded-[28px] border border-slate-200 bg-white/97 p-4 shadow-md sm:p-5">
          <RolesHeader
            rolesLoading={rolesLoading}
            canManageRoles={canManageRoles}
            onRefresh={loadRolesAndPermissions}
            onCreateRole={handleCreateRole}
            newRoleName={newRoleName}
            onNewRoleNameChange={setNewRoleName}
            savingRole={savingRole}
          />

          {rolesError ? (
            <Alert tone="danger" className="mb-3">
              <AlertDescription>{rolesError}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
            <RolesList
              roles={roles}
              selectedRoleName={selectedRoleName}
              onSelectRole={setSelectedRoleName}
              deletingRoleName={deletingRoleName}
              onDeleteRole={handleDeleteRole}
              canManageRoles={canManageRoles}
            />

            <PermissionsPanel
              selectedRoleName={selectedRoleName}
              onSavePermissions={handleSaveRolePermissions}
              canManageRoles={canManageRoles}
              savingRole={savingRole}
              permisosCatalogo={permisosCatalogo}
              selectedRolePermisos={selectedRolePermisos}
              onTogglePermission={(permisoCodigo, isChecked) => {
                setSelectedRolePermisos((prev) => {
                  if (isChecked) return [...new Set([...prev, permisoCodigo])].sort();
                  return prev.filter((code) => code !== permisoCodigo);
                });
              }}
            />
          </div>
        </section>
      </section>
    </AdminLayout>
  );
}
