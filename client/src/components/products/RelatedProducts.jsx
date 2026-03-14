import { useEffect, useState } from "react";
import api from "../../api/client.js";
import { ProductCard } from "./ProductCard.jsx";

export function RelatedProducts({ productId, categoryId }) {
  const [related, setRelated] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [a, b] = await Promise.all([
        api.get(`/products/related/${productId}?limit=4`),
        categoryId ? api.get(`/products?category=${categoryId}&limit=4`) : Promise.resolve({ data: { items: [] } }),
      ]);
      const merged = [...(a.data.items || []), ...(b.data.items || [])];
      const unique = Array.from(new Map(merged.map((p) => [p._id, p])).values()).slice(0, 4);
      if (mounted) setRelated(unique);
    })();
    return () => {
      mounted = false;
    };
  }, [productId, categoryId]);

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Related products</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {related.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
}
