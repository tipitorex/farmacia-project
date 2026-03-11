import { SparkIcon } from "../ui/Icons";

export default function HeroBanner() {
  return (
    <section className="hero-shell rounded-3xl border border-emerald-100 p-6 shadow-lg sm:p-8">
      <p className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-700">
        <SparkIcon className="h-3.5 w-3.5" />
        Promos destacadas
      </p>
      <h2 className="mt-4 max-w-2xl text-3xl font-extrabold leading-tight text-emerald-900 sm:text-4xl">
        Ahorra hoy en farmacia, cuidado personal y bebe
      </h2>
      <div className="mt-5 flex flex-wrap gap-3">
        <button className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-600">
          Comprar ahora
        </button>
        <button className="rounded-xl border border-emerald-300 bg-white px-4 py-2 text-sm font-bold text-emerald-700">
          Ver categorias
        </button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/60 bg-white/70 p-3 text-xs font-semibold text-emerald-800">Hasta 30% OFF en vitaminas</div>
        <div className="rounded-2xl border border-white/60 bg-white/70 p-3 text-xs font-semibold text-emerald-800">Delivery en 60 min</div>
        <div className="rounded-2xl border border-white/60 bg-white/70 p-3 text-xs font-semibold text-emerald-800">2x1 en cuidado personal</div>
      </div>
    </section>
  );
}
