import { Button } from "../../ui/button";
import { Input } from "../../ui/input";

export default function RolesHeader({
  rolesLoading,
  canManageRoles,
  onRefresh,
  onCreateRole,
  newRoleName,
  onNewRoleNameChange,
  savingRole,
}) {
  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-slate-900">Configuracion de roles y permisos</h3>
          <p className="text-sm text-slate-500">Administra los roles disponibles y sus permisos operativos.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={onRefresh} disabled={rolesLoading || !canManageRoles}>
          {rolesLoading ? "Actualizando..." : "Actualizar"}
        </Button>
      </div>

      <form className="mb-4 flex flex-col gap-2 sm:flex-row" onSubmit={onCreateRole}>
        <Input
          type="text"
          value={newRoleName}
          onChange={(event) => onNewRoleNameChange(event.target.value)}
          placeholder="Nombre del nuevo rol (ej: supervisor)"
          aria-label="Nombre del nuevo rol"
          disabled={!canManageRoles || savingRole}
        />
        <Button type="submit" disabled={!canManageRoles || savingRole || !newRoleName.trim()} className="bg-teal-700 hover:bg-teal-600">
          Crear rol
        </Button>
      </form>
    </>
  );
}
