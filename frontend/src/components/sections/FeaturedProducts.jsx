import { featuredProducts } from "../../data/homeData";
import { Button } from "../ui/button";
import ProductCard from "../ui/ProductCard";

export default function FeaturedProducts() {
  return (
    <section className="rounded-[28px] border border-sky-100 bg-white/97 p-5 shadow-2xl shadow-slate-200/60 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-xl font-black text-slate-900">Ofertas destacadas</h3>
        <Button variant="ghost" size="sm" className="text-sky-700 hover:bg-sky-50">
          Ver catalogo
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
