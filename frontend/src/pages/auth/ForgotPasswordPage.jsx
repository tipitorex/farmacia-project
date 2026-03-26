import { useState } from "react";
import { Link } from "react-router-dom";
import AuthPageShell from "../../components/auth/AuthPageShell";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { getErrorMessage } from "../../lib/utils";
import { requestPasswordReset } from "../../services/authService";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const data = await requestPasswordReset(email);
      setMessage(data.detail || "Si el correo existe, te enviaremos un enlace de recuperacion.");
      setEmail("");
    } catch (errorData) {
      setError(getErrorMessage(errorData, "No se pudo procesar la solicitud de recuperacion."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthPageShell
      eyebrow="Recuperacion"
      title="Recuperar acceso"
      description="Solicita el enlace para restablecer la contrasena desde una vista propia, sin cargar mas logica en la home."
    >
      {message ? (
        <Alert tone="success">
          <AlertTitle>Solicitud enviada</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      {error ? (
        <Alert tone="danger">
          <AlertTitle>No se pudo completar la solicitud</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="forgot-password-email-page">Correo electronico</Label>
          <Input
            id="forgot-password-email-page"
            type="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            disabled={submitting}
          />
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Enviando enlace..." : "Enviar enlace de recuperacion"}
        </Button>
      </form>

      <div className="rounded-2xl border border-slate-100 bg-slate-50/90 p-4 text-sm text-slate-600">
        <Link to="/login" className="font-semibold text-emerald-700 transition hover:text-emerald-600">
          Volver a iniciar sesion
        </Link>
      </div>
    </AuthPageShell>
  );
}