import { featuredProducts } from "../../data/homeData";
import ProductCard from "../ui/ProductCard";

export default function FeaturedProducts() {
  return (
    <section className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-lg sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-xl font-black text-emerald-900">Ofertas del dia</h3>
        <button className="text-xs font-bold text-emerald-700" type="button">
          Ver mas
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
