import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { CloseIcon } from "../../ui/Icons";
import { Input } from "../../ui/input";

export default function CreateUserModal({
  isOpen,
  onClose,
  onSubmit,
  form,
  onFormChange,
  effectiveRoleOptions,
  creatingUser,
}) {
  if (!isOpen) return null;

  return (
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
              onClick={onClose}
              aria-label="Cerrar"
              className="rounded-xl border border-slate-200 bg-white/80 p-2 text-slate-500 transition hover:border-slate-300 hover:bg-white hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-5">
          <form className="space-y-3" onSubmit={onSubmit}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                type="text"
                placeholder="Nombre"
                value={form.first_name}
                onChange={(event) => onFormChange({ ...form, first_name: event.target.value })}
              />
              <Input
                type="text"
                placeholder="Apellido"
                value={form.last_name}
                onChange={(event) => onFormChange({ ...form, last_name: event.target.value })}
              />
            </div>
            <Input
              type="email"
              placeholder="Correo electronico"
              value={form.email}
              onChange={(event) => onFormChange({ ...form, email: event.target.value })}
            />
            <Input
              type="password"
              placeholder="Contrasena"
              value={form.password}
              onChange={(event) => onFormChange({ ...form, password: event.target.value })}
              required
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                value={form.role}
                onChange={(event) => onFormChange({ ...form, role: event.target.value })}
                aria-label="Rol del nuevo usuario"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
              >
                {effectiveRoleOptions.map((roleName) => (
                  <option key={roleName} value={roleName}>
                    {roleName}
                  </option>
                ))}
              </select>
              <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(event) => onFormChange({ ...form, is_active: event.target.checked })}
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
  );
}
