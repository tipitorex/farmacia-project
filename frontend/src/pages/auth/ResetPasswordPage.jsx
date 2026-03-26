import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { confirmPasswordReset } from "../../services/authService";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { EyeIcon, EyeOffIcon } from "../../components/ui/Icons";
import { getErrorMessage } from "../../lib/utils";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";

  const [form, setForm] = useState({ password: "", passwordConfirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => Boolean(uid && token), [uid, token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const data = await confirmPasswordReset({
        uid,
        token,
        password: form.password,
        passwordConfirm: form.passwordConfirm,
      });
      setMessage(data.detail || "Contrasena actualizada correctamente.");
      setForm({ password: "", passwordConfirm: "" });
    } catch (errorData) {
      setError(getErrorMessage(errorData, "No se pudo actualizar la contrasena."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="farm-bg flex min-h-screen items-center justify-center px-4 py-8 text-slate-800 sm:px-6 lg:px-8">
      <Card className="w-full max-w-xl overflow-hidden border-emerald-100/80 bg-white/95 backdrop-blur">
        <CardHeader className="border-b border-emerald-100 bg-[linear-gradient(135deg,rgba(236,253,245,0.95),rgba(240,249,255,0.95))]">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">Seguridad</p>
          <CardTitle>Restablecer contrasena</CardTitle>
          <CardDescription>
            Define una nueva clave para recuperar el acceso a tu cuenta de forma segura.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 pt-6">
          {!canSubmit ? (
            <Alert tone="danger">
              <AlertTitle>Enlace invalido</AlertTitle>
              <AlertDescription>El enlace de recuperacion es invalido o esta incompleto.</AlertDescription>
            </Alert>
          ) : null}

          {message ? (
            <Alert tone="success">
              <AlertTitle>Contrasena actualizada</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          ) : null}

          {error ? (
            <Alert tone="danger">
              <AlertTitle>No se pudo actualizar</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="reset-password">Nueva contrasena</Label>
              <div className="relative">
                <Input
                  id="reset-password"
                  className="pr-12"
                  placeholder="Ingresa tu nueva contrasena"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                  required
                  disabled={!canSubmit || submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-emerald-700 transition hover:bg-emerald-50"
                  disabled={!canSubmit || submitting}
                  aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                >
                  {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reset-password-confirm">Confirmar nueva contrasena</Label>
              <div className="relative">
                <Input
                  id="reset-password-confirm"
                  className="pr-12"
                  placeholder="Repite la nueva contrasena"
                  type={showPasswordConfirm ? "text" : "password"}
                  value={form.passwordConfirm}
                  onChange={(event) => setForm((prev) => ({ ...prev, passwordConfirm: event.target.value }))}
                  required
                  disabled={!canSubmit || submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-emerald-700 transition hover:bg-emerald-50"
                  disabled={!canSubmit || submitting}
                  aria-label={showPasswordConfirm ? "Ocultar contrasena" : "Mostrar contrasena"}
                >
                  {showPasswordConfirm ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <Button className="w-full sm:w-auto" type="submit" disabled={!canSubmit || submitting}>
                {submitting ? "Actualizando..." : "Actualizar contrasena"}
              </Button>
              <p className="text-xs leading-5 text-slate-500 sm:max-w-[220px]">
                Usa una contrasena segura y distinta a la que ya tenias registrada.
              </p>
            </div>
          </form>

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
            <Link to="/" className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-600">
              Volver al inicio
            </Link>
            <span className="text-xs text-slate-400">Tu enlace expira segun la configuracion de seguridad del backend.</span>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
