import { ProductCard } from "../products/ProductCard.jsx";

export function HorizontalProductRow({ products = [], className = "" }) {
  if (!products.length) return null;

  return (
    <div
      className={`-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${className}`}
    >
      <div className="flex gap-3 snap-x snap-mandatory pb-2 sm:gap-4">
        {products.map((p) => (
          <div
            key={p.variantKey || `${p._id}-${p.displayColor || "default"}`}
            className="snap-start min-w-[75%] sm:min-w-[48%] md:min-w-[32%] lg:min-w-[24%]"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}
