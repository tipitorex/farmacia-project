import { categories } from "../../data/homeData";

const categoryIcons = {
  Medicamentos: "RX",
  "Mamas y Bebes": "BABY",
  "Cuidado Personal": "CARE",
  Vitaminas: "VIT",
  Belleza: "BEAUTY",
  "Adulto Mayor": "SENIOR",
  Higiene: "HIG",
  Nutricion: "NUT",
};

export default function CategoryGrid() {
  return (
    <section className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-lg sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-xl font-black text-emerald-900">Explora por categorias</h3>
        <button className="text-xs font-bold text-emerald-700" type="button">
          Ver todas
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 px-3 py-5 text-sm font-bold text-emerald-900 transition hover:-translate-y-0.5 hover:border-emerald-300"
          >
            <span className="mb-1 inline-block rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-emerald-700">{categoryIcons[category] || "SHOP"}</span>
            <span className="block text-xs uppercase tracking-widest text-emerald-600">Categoria</span>
            <span className="mt-1 block">{category}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
