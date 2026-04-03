import { Button } from "../../ui/button";

export default function RolesList({ roles, selectedRoleName, onSelectRole, deletingRoleName, onDeleteRole, canManageRoles }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Roles</p>
      <div className="space-y-2">
        {roles.map((roleItem) => {
          const isActiveRole = roleItem.nombre === selectedRoleName;
          const isDeleting = deletingRoleName === roleItem.nombre;
          const canDeleteRole = roleItem.nombre !== "admin";

          return (
            <div
              key={roleItem.nombre}
              className={`flex items-center gap-2 rounded-xl border px-2 py-2 ${isActiveRole ? "border-teal-600 bg-teal-50" : "border-slate-200 bg-white"}`}
            >
              <button
                type="button"
                onClick={() => onSelectRole(roleItem.nombre)}
                className="min-w-0 flex-1 truncate text-left text-sm font-semibold text-slate-800"
              >
                {roleItem.nombre}
              </button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onDeleteRole(roleItem.nombre)}
                disabled={!canManageRoles || !canDeleteRole || isDeleting}
              >
                {isDeleting ? "..." : "Eliminar"}
              </Button>
            </div>
          );
        })}

        {!roles.length ? <p className="text-xs text-slate-500">No hay roles disponibles.</p> : null}
      </div>
    </div>
  );
}
