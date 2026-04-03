import { Button } from "../../ui/button";

export default function PermissionsPanel({
  selectedRoleName,
  onSavePermissions,
  canManageRoles,
  savingRole,
  permisosCatalogo,
  selectedRolePermisos,
  onTogglePermission,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Permisos</p>
          <h4 className="text-sm font-black text-slate-900">{selectedRoleName ? `Rol: ${selectedRoleName}` : "Selecciona un rol"}</h4>
        </div>
        <Button
          size="sm"
          onClick={onSavePermissions}
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
                onChange={(event) => onTogglePermission(permiso.codigo, event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
              />
              <span>
                <span className="block font-semibold text-slate-800">{permiso.nombre}</span>
                <span className="block text-xs text-slate-500">{permiso.codigo}</span>
              </span>
            </label>
          );
        })}
        {!permisosCatalogo.length ? <p className="text-sm text-slate-500">No se encontraron permisos en el catalogo.</p> : null}
      </div>
    </div>
  );
}
