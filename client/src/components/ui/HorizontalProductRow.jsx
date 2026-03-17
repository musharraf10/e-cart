import { ProductCard } from "../products/ProductCard.jsx";

export function HorizontalProductRow({ products = [], className = "" }) {
  if (!products.length) return null;

  return (
    <div className={`-mx-4 px-4 overflow-x-auto ${className}`}>
      <div className="flex gap-3 sm:gap-4 snap-x snap-mandatory pb-2">
        {products.map((p) => (
          <div
            key={p._id}
            className="snap-start min-w-[60%] sm:min-w-[42%] md:min-w-[31%] lg:min-w-[24%]"
          >
            <ProductCard product={p} compact />
          </div>
        ))}
      </div>
    </div>
  );
}
