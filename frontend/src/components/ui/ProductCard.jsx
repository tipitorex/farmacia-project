import { CartIcon } from "./Icons";

export default function ProductCard({ product }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{product.category}</p>
      <h4 className="mt-2 text-sm font-bold text-slate-900">{product.name}</h4>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-base font-black text-emerald-800">{product.price}</span>
        <span className="text-xs text-slate-400 line-through">{product.oldPrice}</span>
      </div>
      <button
        type="button"
        className="mt-4 inline-flex w-full items-center justify-center gap-1 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-600"
      >
        <CartIcon className="h-3.5 w-3.5" />
        Agregar al carrito
      </button>
    </article>
  );
}
