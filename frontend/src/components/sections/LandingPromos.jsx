import { popularBrands, promoBlocks } from "../../data/homeData";
import { Button } from "../ui/button";

export default function LandingPromos() {
  return (
    <section className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        {promoBlocks.map((promo) => (
          <article
            key={promo.title}
            className={`rounded-[28px] border p-5 shadow-2xl shadow-slate-200/60 sm:p-6 ${
              promo.tone === "primary"
                ? "border-teal-200 bg-gradient-to-br from-teal-600 to-cyan-600 text-white"
                : "border-sky-200 bg-gradient-to-br from-white to-sky-50 text-slate-800"
            }`}
          >
            <p
              className={`text-[11px] font-bold uppercase tracking-[0.2em] ${
                promo.tone === "primary" ? "text-teal-100" : "text-sky-700"
              }`}
            >
              Destacado
            </p>
            <h3 className="mt-2 text-xl font-black leading-tight">{promo.title}</h3>
            <p
              className={`mt-2 text-sm leading-relaxed ${
                promo.tone === "primary" ? "text-teal-50" : "text-slate-600"
              }`}
            >
              {promo.description}
            </p>
            <Button
              size="sm"
              className={`mt-4 ${
                promo.tone === "primary"
                  ? "bg-white text-teal-700 hover:bg-teal-50"
                  : "bg-sky-700 text-white hover:bg-sky-600"
              }`}
            >
              {promo.cta}
            </Button>
          </article>
        ))}
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white/97 p-4 shadow-md">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-700">Marcas populares</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {popularBrands.map((brand) => (
            <span
              key={brand}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
