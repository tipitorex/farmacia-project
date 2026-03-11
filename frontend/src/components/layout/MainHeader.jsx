import { navItems } from "../../data/homeData";
import { CartIcon, MapPinIcon, SearchIcon, UserIcon } from "../ui/Icons";

export default function MainHeader() {
  return (
    <header className="rounded-3xl border border-emerald-100 bg-white/95 p-4 shadow-lg backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Farmacia Project</p>
          <h1 className="text-xl font-black text-emerald-900 sm:text-2xl">Tu farmacia online</h1>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 transition hover:border-emerald-300">
            <MapPinIcon className="h-4 w-4" />
            Mi ubicacion
          </button>
          <button className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-bold text-emerald-700">
            <UserIcon className="h-4 w-4" />
            Cuenta
          </button>
          <button className="inline-flex items-center gap-1 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-600">
            <CartIcon className="h-4 w-4" />
            Carrito
          </button>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <div className="relative min-w-[220px] flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
          <input
            className="w-full rounded-xl border border-emerald-100 bg-emerald-50/40 px-9 py-2 text-sm outline-none focus:border-emerald-300"
            placeholder="Buscar productos"
            type="text"
          />
        </div>
        <button className="rounded-xl border border-emerald-100 bg-white px-4 py-2 text-xs font-bold text-emerald-700">
          Ofertas flash
        </button>
      </div>
      <nav className="mt-4 flex flex-wrap gap-2">
        {navItems.map((item) => (
          <button
            key={item}
            className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:border-emerald-300"
            type="button"
          >
            {item}
          </button>
        ))}
      </nav>
    </header>
  );
}
