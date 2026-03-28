import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import api from "../api/client.js";
import { ProductCard } from "../components/products/ProductCard.jsx";
import { ProductListItem } from "../components/products/ProductListItem.jsx";
import { ProductGrid } from "../components/ui/ProductGrid.jsx";
import { SectionHeader } from "../components/ui/SectionHeader.jsx";
import { ProductGridSkeleton, ProductListSkeleton } from "../components/ui/LoadingSkeleton.jsx";
import { expandProductsByVariant } from "../utils/productVariants.js";
import { useShopScrollRestoration } from "../hooks/useShopScrollRestoration.js";
import { SeoMeta } from "../components/seo/SeoMeta.jsx";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Popularity" },
];

const LIMIT = 12;
const LOAD_MORE_TO_PAGINATION_PAGE = 3;

export function ShopPage() {
  useShopScrollRestoration("shopScroll");

  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [mode, setMode] = useState("loadMore");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [loadMorePage, setLoadMorePage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [cache, setCache] = useState({});

  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const size = searchParams.get("size") || "";
  const color = searchParams.get("color") || "";
  const sort = searchParams.get("sort") || "newest";

  const queryFilters = useMemo(() => {
    const f = { limit: LIMIT, sort };
    if (category) f.category = category;
    if (minPrice) f.minPrice = minPrice;
    if (maxPrice) f.maxPrice = maxPrice;
    if (size) f.size = size;
    if (color) f.color = color;
    return f;
  }, [category, minPrice, maxPrice, size, color, sort]);

  const queryKey = useMemo(() => JSON.stringify(queryFilters), [queryFilters]);
  const getCacheKey = (pageToFetch) => `${queryKey}::${pageToFetch}`;

  const collectFiltersMeta = (productItems) => {
    const catMap = new Map();
    const sizeSet = new Set();
    const colorSet = new Set();

    productItems.forEach((p) => {
      if (p.category?._id) {
        catMap.set(p.category._id, { _id: p.category._id, name: p.category.name, slug: p.category.slug });
      }
      (p.variants || []).forEach((v) => {
        if (v.size) sizeSet.add(v.size);
        if (v.color) colorSet.add(v.color);
      });
    });

    if (catMap.size > 0) setCategories(Array.from(catMap.values()));
    if (sizeSet.size > 0) setSizes(Array.from(sizeSet).sort());
    if (colorSet.size > 0) setColors(Array.from(colorSet).sort());
  };

  const fetchProducts = async ({ pageToFetch = 1, append = false } = {}) => {
    const cacheKey = getCacheKey(pageToFetch);
    const cachedPage = cache[cacheKey];

    if (cachedPage) {
      const nextItems = cachedPage.items || [];
      setItems((prev) => (append ? [...prev, ...nextItems] : nextItems));
      setTotalPages(cachedPage.totalPages ?? 1);
      setTotal(cachedPage.total ?? 0);
      return;
    }

    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const { data } = await api.get("/products", {
        params: { ...queryFilters, page: pageToFetch },
      });

      const nextItems = data.items || [];
      setCache((prev) => ({
        ...prev,
        [cacheKey]: {
          items: nextItems,
          totalPages: data.totalPages ?? 1,
          total: data.total ?? 0,
        },
      }));
      setItems((prev) => (append ? [...prev, ...nextItems] : nextItems));
      setTotalPages(data.totalPages ?? 1);
      setTotal(data.total ?? 0);

      if (categories.length === 0 || sizes.length === 0 || colors.length === 0) {
        collectFiltersMeta(nextItems);
      }
    } catch {
      if (!append) {
        setItems([]);
        setTotalPages(1);
        setTotal(0);
      }
    } finally {
      if (append) setLoadingMore(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    setMode("loadMore");
    setPage(1);
    setLoadMorePage(1);
    fetchProducts({ pageToFetch: 1, append: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  useEffect(() => {
    if (mode !== "pagination") return;
    fetchProducts({ pageToFetch: page, append: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, page]);

  useEffect(() => {
    if (mode !== "pagination") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [mode, page]);

  useEffect(() => {
    if (categories.length > 0 && sizes.length > 0 && colors.length > 0) return;
    api.get("/products", { params: { limit: 100 } }).then(({ data }) => {
      collectFiltersMeta(data.items || []);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === "" || value == null) next.delete(key);
    else next.set(key, value);

    if (key !== "page") {
      next.delete("page");
    }

    setSearchParams(next);
  };

  const setPaginationPage = (nextPage) => {
    setPage(nextPage);
    const next = new URLSearchParams(searchParams);
    next.set("page", String(nextPage));
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const handleLoadMore = async () => {
    const nextPage = loadMorePage + 1;
    await fetchProducts({ pageToFetch: nextPage, append: true });
    setLoadMorePage(nextPage);

    if (nextPage >= LOAD_MORE_TO_PAGINATION_PAGE && nextPage < totalPages) {
      const firstPaginationPage = Math.min(nextPage + 1, totalPages);
      setMode("pagination");
      setPaginationPage(firstPaginationPage);
    }
  };

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;
    setPaginationPage(nextPage);
  };

  const pageNumbers = useMemo(() => {
    const maxVisible = 5;
    let start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  const hasActiveFilters = category || minPrice || maxPrice || size || color;
  const expandedItems = useMemo(() => expandProductsByVariant(items), [items]);
  const canLoadMore = loadMorePage < totalPages;
  const rangeStart = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const rangeEnd = Math.min(rangeStart + expandedItems.length - 1, total);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col lg:flex-row gap-8">
      <SeoMeta
        title="Shop NoorFit | Performance Clothing for Everyday Movement"
        description="Browse the NoorFit shop by category, size, color, and price to find performance-ready styles that match your routine."
        canonicalUrl="/shop"
      />
      <aside className="lg:w-64 flex-shrink-0">
        <div className="rounded-xl bg-card border border-[#262626] p-4 space-y-6 sticky top-24">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Filters</h2>
            {hasActiveFilters && (
              <button type="button" onClick={clearFilters} className="text-xs text-accent hover:underline">
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
          subtitle={
            total > 0
              ? `${total} product${total !== 1 ? "s" : ""} • ${mode === "loadMore" ? "Grid + Load More" : "List + Pagination"}`
              : "Browse the catalog"
          }
          action={mode === "loadMore" ? (
            <select
              value={sort}
              onChange={(e) => setFilter("sort", e.target.value)}
              className="rounded-xl border border-[#262626] bg-card px-4 py-2 text-sm text-white focus:outline-none focus:border-accent"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          ) : null}
        />

        {loading ? (
          mode === "loadMore" ? <ProductGridSkeleton count={LIMIT} /> : <ProductListSkeleton count={6} />
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
              ) : mode === "loadMore" ? (
                <ProductGrid key="grid-mode">
                  {expandedItems.map((p) => (
                    <ProductCard key={p.variantKey || `${p._id}-${p.displayColor || "default"}`} product={p} />
                  ))}
                </ProductGrid>
              ) : (
                <motion.div
                  key="list-mode"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="sticky top-0 z-10 flex items-center justify-between gap-3 rounded-xl border border-[#262626] bg-[#0f0f0f]/95 px-3 py-2 backdrop-blur">
                    <p className="text-xs text-muted">
                      Showing {rangeStart}–{rangeEnd} of {total} results
                    </p>
                    <select
                      value={sort}
                      onChange={(e) => setFilter("sort", e.target.value)}
                      className="rounded-lg border border-[#262626] bg-card px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
                    >
                      {SORT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  {expandedItems.map((p) => (
                    <ProductListItem key={p.variantKey || `${p._id}-${p.displayColor || "default"}`} product={p} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {mode === "loadMore" && expandedItems.length > 0 && (
              <div className="mt-8 flex flex-col items-center gap-3">
                {canLoadMore ? (
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#262626] px-6 py-2 text-sm text-white transition duration-200 hover:bg-card active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loadingMore ? <span className="skeleton-shimmer h-2.5 w-10 rounded-full" aria-hidden /> : null}
                    {loadingMore ? "Loading..." : "Load More"}
                  </button>
                ) : (
                  <div className="space-y-2 text-center">
                    <p className="text-sm text-muted">You're all caught up 🎉</p>
                    <p className="text-xs text-muted">Explore more categories</p>
                    <button
                      type="button"
                      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                      className="rounded-xl border border-[#262626] px-4 py-2 text-xs text-white transition hover:bg-card"
                    >
                      Browse categories
                    </button>
                  </div>
                )}
                {loadingMore && <ProductGridSkeleton count={4} />}
              </div>
            )}

            {mode === "pagination" && totalPages > 1 && (
              <div className="flex flex-wrap justify-center items-center gap-2 mt-8">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => goToPage(page - 1)}
                  className="rounded-xl border border-[#262626] px-4 py-2 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-card"
                >
                  Previous
                </button>

                {pageNumbers.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => goToPage(pageNumber)}
                    disabled={loading}
                    className={`rounded-xl border px-3 py-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      pageNumber === page
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-[#262626] text-white hover:bg-card"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={page >= totalPages || loading}
                  onClick={() => goToPage(page + 1)}
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
