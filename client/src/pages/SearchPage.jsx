import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { HiArrowLeft } from "react-icons/hi";
import api from "../api/client.js";
import { ProductGrid } from "../components/ui/ProductGrid.jsx";
import { ProductGridSkeleton } from "../components/ui/LoadingSkeleton.jsx";
import { ProductCard } from "../components/products/ProductCard.jsx";
import { expandProductsByVariant } from "../utils/productVariants.js";

export function SearchPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const initialQ = params.get("q") || "";
  const [q, setQ] = useState(initialQ);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = q.trim();
    const current = params.get("q") || "";
    if (trimmed !== current) {
      const next = new URLSearchParams(params);
      if (trimmed) next.set("q", trimmed);
      else next.delete("q");
      setParams(next, { replace: true });
    }

    if (!trimmed) {
      setProducts([]);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    const timeoutId = window.setTimeout(async () => {
      try {
        const { data } = await api.get("/products/search", { params: { q: trimmed } });
        if (!active) return;
        setProducts(expandProductsByVariant(data.items || []));
      } finally {
        if (active) setLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [params, q, setParams]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto md:max-w-4xl">
      <div className="sticky top-0 z-10 -mx-4 border-b border-border bg-primary px-4 pb-3 pt-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
            className="-ml-2 rounded-xl p-2 text-white/90 transition-transform active:scale-[0.98]"
            aria-label="Back"
          >
            <HiArrowLeft className="h-6 w-6" />
          </button>
          <div className="flex-1">
            <input
              autoFocus
              type="search"
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Search products"
              className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-white placeholder-muted focus:border-accent focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : products.length ? (
          <ProductGrid>
            {products.map((product) => (
              <ProductCard key={product.variantKey || `${product._id}-${product.displayColor || "default"}`} product={product} compact />
            ))}
          </ProductGrid>
        ) : (
          <div className="rounded-2xl border border-border bg-card py-12 text-center">
            <p className="text-muted">{q.trim() ? "No products found." : "Start typing to search the catalog."}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
