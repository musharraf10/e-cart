import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiArrowLeft, HiAdjustments, HiX } from "react-icons/hi";
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
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [onlyNewDrops, setOnlyNewDrops] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      api.get("/products", { params: { limit: 80, sort: "newest" } }),
      api.get("/categories"),
    ])
      .then(([pRes, cRes]) => {
        if (!mounted) return;
        setAllProducts(pRes.data.items || []);
        setCategories(cRes.data || []);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const next = q.trim();
    const current = params.get("q") || "";
    if (next === current) return;
    const newParams = new URLSearchParams(params);
    if (next) newParams.set("q", next);
    else newParams.delete("q");
    setParams(newParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, setParams]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    let data = [...allProducts];

    if (activeCategory !== "All") {
      data = data.filter((p) => {
        const name = p.category?.name || "";
        const id = p.category?._id || p.category;
        const match = categories.find(
          (c) => c.name.toLowerCase() === activeCategory.toLowerCase(),
        );
        if (match) return id === match._id || name.toLowerCase() === activeCategory.toLowerCase();
        return name.toLowerCase().includes(activeCategory.toLowerCase());
      });
    }

    if (onlyNewDrops) {
      data = data.filter((p) => Boolean(p.isNewDrop));
    }

    if (query) {
      data = data.filter((p) => {
        const hay = `${p.name || ""} ${p.category?.name || ""}`.toLowerCase();
        return hay.includes(query);
      });
    }

    if (sortBy === "newest") data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    if (sortBy === "price-low") data.sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sortBy === "price-high") data.sort((a, b) => (b.price || 0) - (a.price || 0));
    if (sortBy === "rating") data.sort((a, b) => (b.ratingsAverage || 0) - (a.ratingsAverage || 0));

    return expandProductsByVariant(data);
  }, [allProducts, q, activeCategory, onlyNewDrops, sortBy, categories]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      className="md:max-w-4xl md:mx-auto"
    >
      <div className="md:hidden sticky top-0 z-10 -mx-4 px-4 pt-3 pb-3 bg-[#0f0f0f] border-b border-[#262626]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
            className="p-2 -ml-2 rounded-xl text-white/90 active:scale-[0.98] transition-transform"
            aria-label="Back"
          >
            <HiArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <input
              autoFocus
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products"
              className="h-11 w-full rounded-xl border border-[#262626] bg-card px-3 text-sm text-white placeholder-muted focus:outline-none focus:border-accent"
            />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="h-10 px-3 rounded-xl border border-[#262626] bg-card text-white inline-flex items-center gap-2 active:scale-[0.99] transition-transform"
          >
            <HiAdjustments className="w-5 h-5 text-muted" />
            <span className="text-sm font-medium">Filter</span>
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 flex-1 rounded-xl border border-[#262626] bg-card px-3 text-sm text-white focus:outline-none focus:border-accent"
          >
            <option value="relevance">Relevance</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low</option>
            <option value="price-high">Price: High</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      <div className="hidden md:block mb-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Search
          </h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="h-10 px-4 rounded-xl border border-[#262626] bg-card text-white inline-flex items-center gap-2"
            >
              <HiAdjustments className="w-5 h-5 text-muted" />
              Filters
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 rounded-xl border border-[#262626] bg-card px-3 text-sm text-white focus:outline-none focus:border-accent"
            >
              <option value="relevance">Relevance</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low</option>
              <option value="price-high">Price: High</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
        <div className="mt-3">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products"
            className="h-11 w-full rounded-xl border border-[#262626] bg-card px-3 text-sm text-white placeholder-muted focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {loading ? (
        <ProductGridSkeleton count={8} />
      ) : filtered.length ? (
        <ProductGrid>
          {filtered.map((product) => (
            <ProductCard key={product.variantKey || `${product._id}-${product.displayColor || "default"}`} product={product} compact />
          ))}
        </ProductGrid>
      ) : (
        <div className="rounded-2xl bg-card border border-[#262626] py-12 text-center">
          <p className="text-muted">No products found.</p>
        </div>
      )}

      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-primary/80 backdrop-blur-sm"
              onClick={() => setFiltersOpen(false)}
              aria-hidden
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.22 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-card border border-[#262626] border-b-0 shadow-xl safe-area-pb"
            >
              <div className="flex items-center justify-between p-4 border-b border-[#262626]">
                <h2 className="text-lg font-semibold text-white">Filters</h2>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="p-2 text-muted hover:text-white rounded-lg"
                  aria-label="Close"
                >
                  <HiX className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 pb-8 space-y-6 max-h-[70vh] overflow-auto">
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-wider text-muted">
                    Category
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveCategory("All")}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                        activeCategory === "All"
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-[#262626] text-muted hover:text-white"
                      }`}
                    >
                      All
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c._id}
                        type="button"
                        onClick={() => setActiveCategory(c.name)}
                        className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                          activeCategory?.toLowerCase() === c.name.toLowerCase()
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-[#262626] text-muted hover:text-white"
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-[#262626] bg-primary px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">New Drops</p>
                    <p className="text-xs text-muted">Show only newly released products</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOnlyNewDrops((v) => !v)}
                    className={`h-7 w-12 rounded-full border transition-colors ${
                      onlyNewDrops
                        ? "bg-accent border-accent"
                        : "bg-card border-[#262626]"
                    }`}
                    aria-pressed={onlyNewDrops}
                    aria-label="Toggle new drops"
                  >
                    <span
                      className={`block h-6 w-6 rounded-full bg-[#0f0f0f] transition-transform ${
                        onlyNewDrops ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory("All");
                      setOnlyNewDrops(false);
                    }}
                    className="flex-1 h-12 rounded-xl border border-[#262626] bg-primary text-white font-semibold active:scale-[0.99] transition-transform"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(false)}
                    className="flex-1 h-12 rounded-xl bg-accent text-primary font-semibold active:scale-[0.99] transition-transform"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

