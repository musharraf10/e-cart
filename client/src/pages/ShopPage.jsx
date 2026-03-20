import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/client.js";
import { ProductCard } from "../components/products/ProductCard.jsx";
import { ProductGrid } from "../components/ui/ProductGrid.jsx";
import { SectionHeader } from "../components/ui/SectionHeader.jsx";
import { ProductGridSkeleton } from "../components/ui/LoadingSkeleton.jsx";
import { expandProductsByVariant } from "../utils/productVariants.js";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Popularity" },
];

const LIMIT = 12;

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);

  const page = Number(searchParams.get("page")) || 1;
  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const size = searchParams.get("size") || "";
  const color = searchParams.get("color") || "";
  const sort = searchParams.get("sort") || "newest";

  const filters = useMemo(() => {
    const f = { page, limit: LIMIT, sort };
    if (category) f.category = category;
    if (minPrice) f.minPrice = minPrice;
    if (maxPrice) f.maxPrice = maxPrice;
    if (size) f.size = size;
    if (color) f.color = color;
    return f;
  }, [page, category, minPrice, maxPrice, size, color, sort]);

  useEffect(() => {
    setLoading(true);
    api
      .get("/products", { params: filters })
      .then(({ data }) => {
        setItems(data.items || []);
        setTotalPages(data.totalPages ?? 1);
        setTotal(data.total ?? 0);
        if (categories.length === 0 && (data.items || []).length > 0) {
          const catMap = new Map();
          const sizeSet = new Set();
          const colorSet = new Set();
          (data.items || []).forEach((p) => {
            if (p.category?._id) catMap.set(p.category._id, { _id: p.category._id, name: p.category.name, slug: p.category.slug });
            (p.variants || []).forEach((v) => {
              if (v.size) sizeSet.add(v.size);
              if (v.color) colorSet.add(v.color);
            });
          });
          setCategories(Array.from(catMap.values()));
          setSizes(Array.from(sizeSet).sort());
          setColors(Array.from(colorSet).sort());
        }
      })
      .catch(() => {
        setItems([]);
        setTotalPages(1);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    if (categories.length > 0) return;
    api.get("/products", { params: { limit: 100 } }).then(({ data }) => {
      const catMap = new Map();
      const sizeSet = new Set();
      const colorSet = new Set();
      (data.items || []).forEach((p) => {
        if (p.category?._id) catMap.set(p.category._id, { _id: p.category._id, name: p.category.name, slug: p.category.slug });
        (p.variants || []).forEach((v) => {
          if (v.size) sizeSet.add(v.size);
          if (v.color) colorSet.add(v.color);
        });
      });
      setCategories(Array.from(catMap.values()));
      setSizes(Array.from(sizeSet).sort());
      setColors(Array.from(colorSet).sort());
    });
  }, []);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === "" || value == null) next.delete(key);
    else next.set(key, value);
    if (key !== "page") next.delete("page");
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = category || minPrice || maxPrice || size || color;
  const expandedItems = useMemo(() => expandProductsByVariant(items), [items]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col lg:flex-row gap-8"
    >
      <aside className="lg:w-64 flex-shrink-0">
        <div className="rounded-xl bg-card border border-[#262626] p-4 space-y-6 sticky top-24">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Filters</h2>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-accent hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {categories.length > 0 && (
            <div>
              <p className="text-xs text-muted uppercase tracking-wider mb-2">Category</p>
              <select
                value={category}
                onChange={(e) => setFilter("category", e.target.value)}
                className="w-full rounded-lg border border-[#262626] bg-primary px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
              >
                <option value="">All</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-2">Price</p>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                min="0"
                value={minPrice}
                onChange={(e) => setFilter("minPrice", e.target.value)}
                className="w-full rounded-lg border border-[#262626] bg-primary px-3 py-2 text-sm text-white placeholder-muted focus:outline-none focus:border-accent"
              />
              <input
                type="number"
                placeholder="Max"
                min="0"
                value={maxPrice}
                onChange={(e) => setFilter("maxPrice", e.target.value)}
                className="w-full rounded-lg border border-[#262626] bg-primary px-3 py-2 text-sm text-white placeholder-muted focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {sizes.length > 0 && (
            <div>
              <p className="text-xs text-muted uppercase tracking-wider mb-2">Size</p>
              <select
                value={size}
                onChange={(e) => setFilter("size", e.target.value)}
                className="w-full rounded-lg border border-[#262626] bg-primary px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
              >
                <option value="">All</option>
                {sizes.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          {colors.length > 0 && (
            <div>
              <p className="text-xs text-muted uppercase tracking-wider mb-2">Color</p>
              <select
                value={color}
                onChange={(e) => setFilter("color", e.target.value)}
                className="w-full rounded-lg border border-[#262626] bg-primary px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
              >
                <option value="">All</option>
                {colors.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <SectionHeader
          title="Shop"
          subtitle={total > 0 ? `${total} product${total !== 1 ? "s" : ""}` : "Browse the catalog"}
          action={
            <select
              value={sort}
              onChange={(e) => setFilter("sort", e.target.value)}
              className="rounded-xl border border-[#262626] bg-card px-4 py-2 text-sm text-white focus:outline-none focus:border-accent"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          }
        />

        {loading ? (
          <ProductGridSkeleton count={LIMIT} />
        ) : (
          <>
            <AnimatePresence mode="wait">
              {expandedItems.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl bg-card border border-[#262626] py-16 text-center"
                >
                  <p className="text-muted">No products match your filters.</p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-3 text-accent text-sm font-medium hover:underline"
                  >
                    Clear filters
                  </button>
                </motion.div>
              ) : (
                <ProductGrid key="grid">
                  {expandedItems.map((p) => (
                    <ProductCard key={p.variantKey || `${p._id}-${p.displayColor || "default"}`} product={p} />
                  ))}
                </ProductGrid>
              )}
            </AnimatePresence>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setFilter("page", String(page - 1))}
                  className="rounded-xl border border-[#262626] px-4 py-2 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-card"
                >
                  Previous
                </button>
                <span className="flex items-center px-4 text-muted text-sm">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setFilter("page", String(page + 1))}
                  className="rounded-xl border border-[#262626] px-4 py-2 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-card"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
