import { Button } from "../../ui/button";

export default function UsersTable({ users, usersLoading, hasUsersFilters, canManageUsers, onEditUser, onDeleteUser }) {
  if (usersLoading) {
    return <p className="text-sm text-slate-600">Cargando usuarios...</p>;
  }

  return (
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
                    <Button variant="secondary" size="sm" onClick={() => onEditUser(item)} disabled={isReadOnly}>
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onDeleteUser(item)}
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
  );
}
