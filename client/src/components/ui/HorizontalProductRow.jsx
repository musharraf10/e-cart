import { ProductCard } from "../products/ProductCard.jsx";

export function HorizontalProductRow({ products = [], className = "" }) {
  if (!products.length) return null;

  return (
    <div className={`-mx-4 px-4 overflow-x-auto ${className}`}>
      <div className="flex gap-4 snap-x snap-mandatory pb-2">
        {products.map((p) => (
          <div
            key={p._id}
            className="snap-start min-w-[72%] sm:min-w-[45%] md:min-w-[30%]"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}

