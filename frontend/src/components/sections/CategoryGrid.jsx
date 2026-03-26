import { categories } from "../../data/homeData";
import { Button } from "../ui/button";

const categoryIcons = {
  Medicamentos: "RX",
  "Mama y Bebe": "BABY",
  "Cuidado Personal": "CARE",
  Vitaminas: "VIT",
  Dermocosmetica: "DERMO",
  "Adulto Mayor": "SENIOR",
  Higiene: "HIG",
  "Primeros Auxilios": "AID",
};

export default function CategoryGrid() {
  return (
    <section className="rounded-[28px] border border-sky-100 bg-white/97 p-5 shadow-2xl shadow-slate-200/60 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-xl font-black text-slate-900">Categorias populares</h3>
        <Button variant="ghost" size="sm" className="text-sky-700 hover:bg-sky-50">
          Ver todas
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className="rounded-2xl border border-sky-100 bg-gradient-to-br from-white to-sky-50 px-3 py-5 text-sm font-bold text-slate-900 transition hover:-translate-y-0.5 hover:border-sky-300"
          >
            <span className="mb-1 inline-block rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-sky-700">{categoryIcons[category] || "SHOP"}</span>
            <span className="block text-xs uppercase tracking-widest text-sky-600">Categoria</span>
            <span className="mt-1 block">{category}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
