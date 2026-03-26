import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyEmail } from "../../services/authService";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { getErrorMessage } from "../../lib/utils";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => Boolean(uid && token), [uid, token]);

  useEffect(() => {
    if (!canSubmit) return;

    const runVerification = async () => {
      setSubmitting(true);
      setMessage("");
      setError("");

      try {
        const data = await verifyEmail({ uid, token });
        setMessage(data.detail || "Correo verificado correctamente. Ya puedes iniciar sesion.");
      } catch (errorData) {
        setError(getErrorMessage(errorData, "No se pudo verificar el correo."));
      } finally {
        setSubmitting(false);
      }
    };

    runVerification();
  }, [canSubmit, uid, token]);

  return (
    <main className="farm-bg flex min-h-screen items-center justify-center px-4 py-8 text-slate-800 sm:px-6 lg:px-8">
      <Card className="w-full max-w-xl overflow-hidden border-emerald-100/80 bg-white/95 backdrop-blur">
        <CardHeader className="border-b border-emerald-100 bg-[linear-gradient(135deg,rgba(236,253,245,0.95),rgba(240,249,255,0.95))]">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">Seguridad</p>
          <CardTitle>Verificacion de correo</CardTitle>
          <CardDescription>
            Confirmamos tu cuenta desde este enlace antes de permitir el acceso completo al sistema.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 pt-6">
          {!canSubmit ? (
            <Alert tone="danger">
              <AlertTitle>Enlace invalido</AlertTitle>
              <AlertDescription>El enlace de verificacion es invalido o esta incompleto.</AlertDescription>
            </Alert>
          ) : null}

          {submitting ? (
            <Alert tone="info">
              <AlertTitle>Procesando verificacion</AlertTitle>
              <AlertDescription>Estamos validando tu correo y preparando el acceso.</AlertDescription>
            </Alert>
          ) : null}

          {message ? (
            <Alert tone="success">
              <AlertTitle>Correo verificado</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          ) : null}

          {error ? (
            <Alert tone="danger">
              <AlertTitle>No se pudo verificar</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="rounded-2xl border border-slate-100 bg-slate-50/90 p-4 text-sm leading-6 text-slate-600">
            Una vez confirmada tu cuenta, podras iniciar sesion desde la pagina principal y continuar con el flujo normal de compra o administracion segun tu rol.
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
            <Link to="/" className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-600">
              Ir al inicio
            </Link>
            <span className="text-xs text-slate-400">Si el enlace expiro, deberas solicitar uno nuevo desde el registro.</span>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
