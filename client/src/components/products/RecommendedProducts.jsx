import { SectionHeader } from "../ui/SectionHeader.jsx";
import { ProductGridSkeleton } from "../ui/LoadingSkeleton.jsx";
import { ProductGrid } from "../ui/ProductGrid.jsx";
import { ProductCard } from "./ProductCard.jsx";
import { expandProductsByVariant } from "../../utils/productVariants.js";

export function RecommendedProducts({ items = [], loading = false }) {
  const expandedItems = expandProductsByVariant(items).slice(0, 8);

  if (!loading && expandedItems.length === 0) return null;

  return (
    <section className="mt-8">
      <SectionHeader title="More products" subtitle="Fresh picks you might like" />
      {loading ? (
        <ProductGridSkeleton count={4} />
      ) : (
        <ProductGrid>
          {expandedItems.map((product) => (
            <ProductCard key={product.variantKey || `${product._id}-${product.displayColor || "default"}`} product={product} />
          ))}
        </ProductGrid>
      )}
    </section>
  );
}
