import { useEffect, useMemo, useState } from "react";
import MainHeader from "../components/layout/MainHeader";
import SiteFooter from "../components/layout/SiteFooter";
import TopStrip from "../components/layout/TopStrip";
import AuthPanel from "../components/sections/AuthPanel";
import CategoryGrid from "../components/sections/CategoryGrid";
import FeaturedProducts from "../components/sections/FeaturedProducts";
import HeroBanner from "../components/sections/HeroBanner";
import QuickActions from "../components/sections/QuickActions";
import { getApiBaseUrl, getCurrentUser, loginUser, registerUser } from "../services/authService";

function getErrorMessage(data, fallback) {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;

  const firstErrorField = Object.keys(data)[0];
  if (!firstErrorField) return fallback;

  const firstError = data[firstErrorField];
  if (Array.isArray(firstError) && firstError[0]) return `${firstErrorField}: ${firstError[0]}`;
  if (typeof firstError === "string") return `${firstErrorField}: ${firstError}`;
  return fallback;
}

export default function HomePage() {
  const [mode, setMode] = useState("login");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState(localStorage.getItem("access_token") || "");
  const [user, setUser] = useState(null);
  const [registerForm, setRegisterForm] = useState({ username: "", email: "", password: "" });
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });

  const isAuthenticated = useMemo(() => Boolean(token && user), [token, user]);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    getCurrentUser(token)
      .then((data) => setUser(data))
      .catch((err) => {
        setMessage(err.message || "Sesion invalida.");
        localStorage.removeItem("access_token");
        setToken("");
      });
  }, [token]);

  const handleRegister = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const data = await registerUser(registerForm);
      localStorage.setItem("access_token", data.access);
      setToken(data.access);
      setUser(data.user);
      setMessage("Registro completado correctamente.");
    } catch (errorData) {
      setMessage(getErrorMessage(errorData, "No se pudo completar el registro."));
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const data = await loginUser(loginForm);
      localStorage.setItem("access_token", data.access);
      setToken(data.access);
      setUser(data.user);
      setMessage("Sesion iniciada correctamente.");
    } catch (errorData) {
      setMessage(getErrorMessage(errorData, "No se pudo iniciar sesion."));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setToken("");
    setUser(null);
    setMessage("Sesion cerrada.");
  };

  return (
    <main className="farm-bg min-h-screen px-4 py-8 text-slate-800 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-6xl space-y-5">
        <TopStrip />
        <MainHeader />
        <HeroBanner />
        <QuickActions />
        <CategoryGrid />
        <FeaturedProducts />

        <AuthPanel
          mode={mode}
          setMode={setMode}
          message={message}
          isAuthenticated={isAuthenticated}
          user={user}
          registerForm={registerForm}
          setRegisterForm={setRegisterForm}
          loginForm={loginForm}
          setLoginForm={setLoginForm}
          onRegister={handleRegister}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
          API activa en: <code className="font-mono text-emerald-700">{getApiBaseUrl()}</code>
        </div>

        <SiteFooter />
      </section>
    </main>
  );
}
