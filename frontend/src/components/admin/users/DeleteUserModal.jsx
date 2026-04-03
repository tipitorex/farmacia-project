import { Button } from "../../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";

export default function DeleteUserModal({ isOpen, onClose, onConfirm, deletingUser, selectedUser }) {
  if (!isOpen) return null;

  return (
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
            <Button variant="secondary" onClick={onClose} disabled={deletingUser}>
              Cancelar
            </Button>
            <Button onClick={onConfirm} disabled={deletingUser} className="bg-rose-600 text-white hover:bg-rose-500">
              {deletingUser ? "Eliminando..." : "Eliminar usuario"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
