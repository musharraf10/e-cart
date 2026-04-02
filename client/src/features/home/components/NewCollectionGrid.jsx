import { ProductCard } from "../../../components/products/ProductCard.jsx";

export function NewCollectionGrid({ products = [] }) {
  if (!products.length) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">New collection</h2>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
        {products.map((product) => (
          <ProductCard key={product.variantKey || product._id} product={product} compact />
        ))}
      </div>
    </section>
  );
}
