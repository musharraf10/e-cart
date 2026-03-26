import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { HiArrowLeft } from "react-icons/hi";
import api from "../api/client.js";
import { ProductGrid } from "../components/ui/ProductGrid.jsx";
import { ProductGridSkeleton } from "../components/ui/LoadingSkeleton.jsx";
import { ProductCard } from "../components/products/ProductCard.jsx";
import { expandProductsByVariant } from "../utils/productVariants.js";

const LIMIT = 12;

export function SearchPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);

  useEffect(() => {
    setQ(params.get("q") || "");
  }, [params]);

  useEffect(() => {
    const trimmed = q.trim();
    const current = params.get("q") || "";
    if (trimmed === current) return;
    const next = new URLSearchParams(params);
    if (trimmed) next.set("q", trimmed);
    else next.delete("q");
    next.delete("page");
    setParams(next, { replace: true });
  }, [q, params, setParams]);

  useEffect(() => {
    const query = (params.get("q") || "").trim();
    const pageFromUrl = Math.max(Number(params.get("page") || 1), 1);

    if (!query) {
      setProducts([]);
      setPages(0);
      setPage(1);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        const { data } = await api.get("/products/search", {
          params: { q: query, page: pageFromUrl, limit: LIMIT },
        });
        if (!active) return;
        setProducts(expandProductsByVariant(data.products || []));
        setPage(data.page || pageFromUrl);
        setPages(data.pages || 0);
      } finally {
        if (active) setLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [params]);

  const emptyLabel = useMemo(
    () => (q.trim() ? "No results found." : "Start typing to search the catalog."),
    [q],
  );

  const setPageInQuery = (nextPage) => {
    const next = new URLSearchParams(params);
    next.set("page", String(nextPage));
    setParams(next);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto md:max-w-4xl">
      <div className="sticky top-0 z-10 -mx-4 border-b border-border bg-primary p-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
            className="-ml-2 rounded-xl p-2 text-white/90 transition-transform active:scale-[0.98]"
            aria-label="Back"
          >
            <HiArrowLeft className="h-6 w-6" />
          </button>
          <input
            autoFocus
            type="search"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Search products and categories"
            className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-white placeholder-muted focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : products.length ? (
          <>
            <ProductGrid>
              {products.map((product) => (
                <ProductCard key={product.variantKey || `${product._id}-${product.displayColor || "default"}`} product={product} compact />
              ))}
            </ProductGrid>
            {pages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setPageInQuery(page - 1)}
                  disabled={page <= 1}
                  className="rounded-xl border border-border px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-muted">Page {page} of {pages}</span>
                <button
                  type="button"
                  onClick={() => setPageInQuery(page + 1)}
                  disabled={page >= pages}
                  className="rounded-xl border border-border px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-border bg-card py-12 text-center">
            <p className="text-muted">{emptyLabel}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
