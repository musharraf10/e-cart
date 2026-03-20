import { useEffect, useState } from "react";
import api from "../../api/client.js";
import { SectionHeader } from "../ui/SectionHeader.jsx";
import { ProductGridSkeleton } from "../ui/LoadingSkeleton.jsx";
import { HorizontalProductRow } from "../ui/HorizontalProductRow.jsx";
import { expandProductsByVariant } from "../../utils/productVariants.js";

export function RelatedProducts({ productId, categoryId }) {
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      api.get(`/products/related/${productId}?limit=8`),
      categoryId
        ? api.get(`/products?category=${categoryId}&limit=8`)
        : Promise.resolve({ data: { items: [] } }),
    ])
      .then(([a, b]) => {
        const merged = [...(a.data.items || []), ...(b.data.items || [])];
        const unique = Array.from(new Map(merged.map((p) => [p._id, p])).values()).slice(0, 8);
        if (mounted) setRelated(unique);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [productId, categoryId]);

  const expandedRelated = expandProductsByVariant(related).slice(0, 8);

  if (expandedRelated.length === 0 && !loading) return null;

  return (
    <section>
      <SectionHeader title="Related products" />
      {loading ? <ProductGridSkeleton count={4} /> : <HorizontalProductRow products={expandedRelated} />}
    </section>
  );
}
