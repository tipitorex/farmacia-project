import { CartIcon } from "./Icons";
import { Button } from "./button";

export default function ProductCard({ product }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">{product.category}</p>
      <h4 className="mt-2 text-sm font-bold text-slate-900">{product.name}</h4>
      <p className="mt-1 text-[11px] font-medium text-slate-500">Disponible en stock</p>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-base font-black text-teal-800">{product.price}</span>
        <span className="text-xs text-slate-400 line-through">{product.oldPrice}</span>
      </div>
      <Button type="button" size="sm" className="mt-4 w-full gap-1 bg-teal-700 hover:bg-teal-600">
        <CartIcon className="h-3.5 w-3.5" />
        Añadir al pedido
      </Button>
    </article>
  );
}
