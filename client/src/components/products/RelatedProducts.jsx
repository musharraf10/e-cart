import { useEffect, useState } from "react";
import api from "../../api/client.js";
import { ProductCard } from "./ProductCard.jsx";
import { SectionHeader } from "../ui/SectionHeader.jsx";
import { ProductGrid } from "../ui/ProductGrid.jsx";
import { ProductGridSkeleton } from "../ui/LoadingSkeleton.jsx";

export function RelatedProducts({ productId, categoryId }) {
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      api.get(`/products/related/${productId}?limit=4`),
      categoryId
        ? api.get(`/products?category=${categoryId}&limit=4`)
        : Promise.resolve({ data: { items: [] } }),
    ])
      .then(([a, b]) => {
        const merged = [...(a.data.items || []), ...(b.data.items || [])];
        const unique = Array.from(
          new Map(merged.map((p) => [p._id, p])).values()
        ).slice(0, 4);
        if (mounted) setRelated(unique);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [productId, categoryId]);

  if (related.length === 0 && !loading) return null;

  return (
    <section>
      <SectionHeader title="Related products" />
      {loading ? (
        <ProductGridSkeleton count={4} />
      ) : (
        <ProductGrid>
          {related.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </ProductGrid>
      )}
    </section>
  );
}
