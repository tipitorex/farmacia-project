export default function AuthPanel({
  mode,
  setMode,
  message,
  isAuthenticated,
  user,
  registerForm,
  setRegisterForm,
  loginForm,
  setLoginForm,
  onRegister,
  onLogin,
  onLogout,
}) {
  return (
    <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-xl sm:p-8">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Acceso</p>
          <h3 className="text-2xl font-black text-emerald-900">Registro e inicio de sesion</h3>
        </div>
      </div>

      {message ? (
        <div className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</div>
      ) : null}

      {isAuthenticated ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h4 className="text-lg font-bold text-slate-800">Sesion activa</h4>
            <ul className="mt-2 space-y-1 text-sm text-slate-700">
              <li>Id: {user?.id}</li>
              <li>Usuario: {user?.username}</li>
              <li>Email: {user?.email || "(sin email)"}</li>
            </ul>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Cerrar sesion
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex gap-2">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                mode === "login" ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              Iniciar sesion
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                mode === "register" ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              Registrarse
            </button>
          </div>

          {mode === "register" ? (
            <form className="space-y-3" onSubmit={onRegister}>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-emerald-600"
                placeholder="Usuario"
                value={registerForm.username}
                onChange={(e) => setRegisterForm((prev) => ({ ...prev, username: e.target.value }))}
                required
              />
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-emerald-600"
                placeholder="Email"
                type="email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-emerald-600"
                placeholder="Password"
                type="password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm((prev) => ({ ...prev, password: e.target.value }))}
                required
              />
              <button
                className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
                type="submit"
              >
                Crear cuenta
              </button>
            </form>
          ) : (
            <form className="space-y-3" onSubmit={onLogin}>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-emerald-600"
                placeholder="Usuario"
                value={loginForm.username}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, username: e.target.value }))}
                required
              />
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-emerald-600"
                placeholder="Password"
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                required
              />
              <button
                className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
                type="submit"
              >
                Entrar
              </button>
            </form>
          )}
        </div>
      )}
    </section>
  );
}
