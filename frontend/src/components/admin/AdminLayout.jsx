import { useMemo, useRef, useState } from "react";
import { adminSections } from "../../data/adminData";
import {
  ChartBarIcon,
  ChevronDownIcon,
  ClipboardListIcon,
  CogIcon,
  DollarIcon,
  LogOutIcon,
  MegaphoneIcon,
  PackageIcon,
  ShieldIcon,
  UserIcon,
  UsersGroupIcon,
} from "../ui/Icons";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import { useAuth } from "../../context/AuthContext";

export default function AdminLayout({ activeSection, setActiveSection, currentUser, onLogout, children }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showUsersSection, setShowUsersSection] = useState(true);
  const userMenuRef = useRef(null);
  const { hasPermission } = useAuth();

  useOutsideClick(userMenuRef, () => setShowUserMenu(false));

  const roleLabel = useMemo(() => {
    if (currentUser?.role === "admin") return "Administrador";
    if (currentUser?.role === "farmaceutico") return "Farmaceutico";
    if (currentUser?.role === "cajero") return "Cajero";
    return "Cliente";
  }, [currentUser]);

  const visibleSections = useMemo(
    () => adminSections.filter((section) => hasPermission(section.requiredPermission)),
    [hasPermission]
  );

  const userManagementSectionIds = ["users", "roles-permisos"];

  const userManagementSections = useMemo(
    () => visibleSections.filter((section) => userManagementSectionIds.includes(section.id)),
    [visibleSections]
  );

  const regularSections = useMemo(
    () => visibleSections.filter((section) => !userManagementSectionIds.includes(section.id)),
    [visibleSections]
  );

  const overviewSection = useMemo(
    () => regularSections.find((section) => section.id === "overview") || null,
    [regularSections]
  );

  const otherRegularSections = useMemo(
    () => regularSections.filter((section) => section.id !== "overview"),
    [regularSections]
  );

  const isUsersSectionActive = userManagementSections.some((section) => section.id === activeSection);

  const fullName = useMemo(() => {
    return [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(" ").trim();
  }, [currentUser]);

  const displayName = useMemo(() => {
    return fullName || currentUser?.username || "Admin";
  }, [fullName, currentUser]);

  const initials = useMemo(() => {
    if (fullName) {
      const parts = fullName.split(" ").filter(Boolean);
      const first = parts[0]?.[0] || "";
      const second = parts[1]?.[0] || "";
      return `${first}${second}`.toUpperCase() || "AD";
    }

    const value = currentUser?.username || "Admin";
    return value.slice(0, 2).toUpperCase();
  }, [currentUser, fullName]);

  const iconMap = {
    dashboard: ChartBarIcon,
    orders: ClipboardListIcon,
    inventory: PackageIcon,
    products: PackageIcon,
    users: UsersGroupIcon,
    customers: UserIcon,
    sales: DollarIcon,
    promotions: MegaphoneIcon,
    reports: ChartBarIcon,
    finance: DollarIcon,
    settings: CogIcon,
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-5 lg:px-6">
        <aside className="rounded-[28px] border border-slate-200 bg-white/97 p-4 shadow-md lg:p-5">
          <div className="mb-5 rounded-2xl bg-gradient-to-r from-teal-700 to-cyan-700 p-4 text-white">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-100">Panel administrativo</p>
            <h1 className="mt-1 text-lg font-black">Farmacia SaludPlus</h1>
          </div>

          <nav className="space-y-1.5">
            {overviewSection ? (() => {
              const Icon = iconMap[overviewSection.icon] || ShieldIcon;
              const isActive = activeSection === overviewSection.id;

              return (
                <button
                  key={overviewSection.id}
                  type="button"
                  onClick={() => setActiveSection(overviewSection.id)}
                  className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition ${
                    isActive
                      ? "border-teal-600 bg-teal-600 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${isActive ? "bg-white/20" : "bg-slate-100 text-slate-600"}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="truncate">{overviewSection.label}</span>
                </button>
              );
            })() : null}

            {userManagementSections.length ? (
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setShowUsersSection((prev) => !prev)}
                  className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition ${
                    isUsersSectionActive
                      ? "border-teal-600 bg-teal-600 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${isUsersSectionActive ? "bg-white/20" : "bg-slate-100 text-slate-600"}`}>
                    <UsersGroupIcon className="h-4 w-4" />
                  </span>
                  <span className="flex-1 truncate">Usuarios</span>
                  <ChevronDownIcon className={`h-4 w-4 transition ${showUsersSection ? "rotate-180" : ""}`} />
                </button>

                {showUsersSection ? (
                  <div className="space-y-1 pl-3">
                    {userManagementSections.map((section) => {
                      const isActive = activeSection === section.id;
                      return (
                        <button
                          key={section.id}
                          type="button"
                          onClick={() => setActiveSection(section.id)}
                          className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition ${
                            isActive
                              ? "border-teal-600 bg-teal-50 text-teal-700"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <span className="truncate">{section.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ) : null}

            {otherRegularSections.map((section) => {
              const Icon = iconMap[section.icon] || ShieldIcon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition ${
                    isActive
                      ? "border-teal-600 bg-teal-600 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${isActive ? "bg-white/20" : "bg-slate-100 text-slate-600"}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="truncate">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="space-y-4">
          <header className="rounded-[28px] border border-slate-200 bg-white/97 p-4 shadow-md sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Backoffice</p>
                <h2 className="text-xl font-black text-slate-900">Gestion operativa</h2>
              </div>
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowUserMenu((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 shadow-sm transition hover:border-slate-300"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-cyan-600 text-xs font-black text-white">
                    {initials}
                  </span>
                  <span className="text-left">
                    <span className="block text-xs font-bold text-slate-800">{displayName}</span>
                    <span className="block text-[11px] text-slate-500">{roleLabel}</span>
                  </span>
                  <ChevronDownIcon className={`h-4 w-4 text-slate-500 transition ${showUserMenu ? "rotate-180" : ""}`} />
                </button>

                {showUserMenu ? (
                  <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                    <div className="border-b border-slate-100 bg-slate-50 px-3 py-2">
                      <p className="text-xs font-bold text-slate-800">{displayName}</p>
                      <p className="text-[11px] text-slate-500">{currentUser?.email || "Sin correo"}</p>
                    </div>
                    <div className="p-1.5">
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        <UserIcon className="h-4 w-4" />
                        Mi perfil
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        <ShieldIcon className="h-4 w-4" />
                        Permisos: {roleLabel}
                      </button>
                      <button
                        type="button"
                        onClick={onLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                      >
                        <LogOutIcon className="h-4 w-4" />
                        Cerrar sesion
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          {children}
        </section>
      </div>
    </main>
  );
}
