import { Button } from "../../ui/button";
import { Input } from "../../ui/input";

export default function UsersToolbar({
  hasUsersFilters,
  onClearFilters,
  canManageUsers,
  onCreateUser,
  onRefresh,
  usersSearch,
  onUsersSearchChange,
  usersRoleFilter,
  onUsersRoleFilterChange,
  usersStatusFilter,
  onUsersStatusFilterChange,
  effectiveRoleOptions,
}) {
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-black text-slate-900">Gestion de usuarios</h3>
        <div className="flex flex-wrap gap-2">
          {hasUsersFilters ? (
            <Button variant="secondary" size="sm" onClick={onClearFilters}>
              Limpiar filtros
            </Button>
          ) : null}
          {canManageUsers ? (
            <Button size="sm" onClick={onCreateUser} className="bg-teal-700 hover:bg-teal-600">
              Nuevo usuario
            </Button>
          ) : null}
          <Button variant="secondary" size="sm" onClick={onRefresh}>
            Actualizar lista
          </Button>
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Input
          type="text"
          value={usersSearch}
          onChange={(event) => onUsersSearchChange(event.target.value)}
          placeholder="Buscar por nombre, correo o rol"
          aria-label="Buscar usuarios"
          className="border-slate-200 bg-slate-50 focus:border-sky-300 focus:ring-sky-100"
        />
        <select
          value={usersRoleFilter}
          onChange={(event) => onUsersRoleFilterChange(event.target.value)}
          aria-label="Filtrar usuarios por rol"
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
        >
          <option value="all">Todos los roles</option>
          {effectiveRoleOptions.map((roleName) => (
            <option key={roleName} value={roleName}>
              {roleName}
            </option>
          ))}
        </select>
        <select
          value={usersStatusFilter}
          onChange={(event) => onUsersStatusFilterChange(event.target.value)}
          aria-label="Filtrar usuarios por estado"
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>
    </>
  );
}
