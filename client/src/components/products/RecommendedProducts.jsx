import { useEffect, useState } from "react";
import api from "../../api/client.js";
import { SectionHeader } from "../ui/SectionHeader.jsx";
import { ProductGridSkeleton } from "../ui/LoadingSkeleton.jsx";
import { ProductGrid } from "../ui/ProductGrid.jsx";
import { ProductCard } from "./ProductCard.jsx";
import { expandProductsByVariant } from "../../utils/productVariants.js";

export function RecommendedProducts({ excludeProductId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get("/products", { params: { limit: 10, sort: "newest" } })
      .then(({ data }) => {
        const all = data.items || [];
        const filtered = excludeProductId
          ? all.filter((p) => p._id !== excludeProductId)
          : all;
        if (mounted) setItems(filtered.slice(0, 8));
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [excludeProductId]);

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

