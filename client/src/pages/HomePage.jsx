import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeroCarousel } from "../components/ui/HeroCarousel.jsx";
import { ProductGrid } from "../components/ui/ProductGrid.jsx";
import { ProductGridSkeleton } from "../components/ui/LoadingSkeleton.jsx";
import { ProductCard } from "../components/products/ProductCard.jsx";
import { ProductListItem } from "../components/products/ProductListItem.jsx";
import { SectionHeader } from "../components/ui/SectionHeader.jsx";
import { HorizontalProductRow } from "../components/ui/HorizontalProductRow.jsx";
import { GridListToggle } from "../components/ui/GridListToggle.jsx";
import Categories from "../pages/CategoryPage.jsx";
import api from "../api/client.js";
import { expandProductsByVariant } from "../utils/productVariants.js";

const CATALOG_LIMIT = 12;

export function HomePage() {
  const [heroProductsSource, setHeroProductsSource] = useState([]);
  const [newDrops, setNewDrops] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [catalogPage, setCatalogPage] = useState(1);
  const [catalogPages, setCatalogPages] = useState(1);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem("product_view_mode") || "grid");
  const [loading, setLoading] = useState(true);
  const [catalogLoading, setCatalogLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([
      api.get("/products", { params: { limit: 20, sort: "newest" } }),
      api.get("/products", { params: { onlyNewDrops: true, limit: 12 } }),
      api.get("/products", { params: { sort: "rating", limit: 8 } }),
      api.get("/categories"),
    ])
      .then(([allRes, dropRes, trendingRes, categoryRes]) => {
        if (!mounted) return;
        setHeroProductsSource(allRes.data.items || []);
        setNewDrops(dropRes.data.items || []);
        setTrendingProducts(trendingRes.data.items || []);
        setCategories(categoryRes.data || []);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("product_view_mode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    let active = true;
    setCatalogLoading(true);
    api
      .get("/products", {
        params: {
          limit: CATALOG_LIMIT,
          page: catalogPage,
          ...(selectedCategory ? { category: selectedCategory } : {}),
        },
      })
      .then(({ data }) => {
        if (!active) return;
        setCatalogProducts(data.items || []);
        setCatalogPages(data.totalPages || 1);
        setCatalogTotal(data.total || 0);
      })
      .finally(() => {
        if (active) setCatalogLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedCategory, catalogPage]);

  const heroProducts = useMemo(() => expandProductsByVariant(heroProductsSource).slice(0, 4), [heroProductsSource]);
  const expandedNewDrops = useMemo(() => expandProductsByVariant(newDrops), [newDrops]);
  const expandedTrendingProducts = useMemo(() => expandProductsByVariant(trendingProducts), [trendingProducts]);
  const expandedCatalogProducts = useMemo(() => expandProductsByVariant(catalogProducts), [catalogProducts]);

  const selectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    setCatalogPage(1);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }} className="space-y-12">
      <section>
        <HeroCarousel products={heroProducts} />
      </section>

      <Categories categories={categories} />

      <section>
        <SectionHeader title="New Drops" subtitle="Freshly added styles" />
        {loading ? <ProductGridSkeleton count={4} /> : <HorizontalProductRow products={expandedNewDrops} />}
      </section>

      <section>
        <SectionHeader title="Trending Products" subtitle="Most loved by shoppers" />
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <ProductGrid>
            {expandedTrendingProducts.map((product) => (
              <ProductCard key={product.variantKey || `${product._id}-${product.displayColor || "default"}`} product={product} />
            ))}
          </ProductGrid>
        )}
      </section>

      <section className="space-y-4">
        <SectionHeader
          title="All Products"
          subtitle={catalogTotal > 0 ? `${catalogTotal} product${catalogTotal === 1 ? "" : "s"}` : "Explore everything in NoorFit"}
          action={<GridListToggle viewMode={viewMode} onChange={setViewMode} />}
        />

        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <button
            type="button"
            onClick={() => selectCategory("")}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors ${selectedCategory === "" ? "border-accent bg-accent/10 text-accent" : "border-border text-muted"}`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              type="button"
              onClick={() => selectCategory(category._id)}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors ${selectedCategory === category._id ? "border-accent bg-accent/10 text-accent" : "border-border text-muted"}`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {catalogLoading ? (
          <ProductGridSkeleton count={CATALOG_LIMIT} />
        ) : expandedCatalogProducts.length ? (
          <AnimatePresence mode="wait">
            {viewMode === "grid" ? (
              <ProductGrid key="grid" className="transition-all duration-200">
                {expandedCatalogProducts.map((product) => (
                  <motion.div key={product.variantKey || `${product._id}-${product.displayColor || "default"}`} layout>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </ProductGrid>
            ) : (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 transition-all duration-200">
                {expandedCatalogProducts.map((product) => (
                  <ProductListItem key={product.variantKey || `${product._id}-${product.displayColor || "default"}`} product={product} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          <div className="rounded-xl border border-border bg-card py-10 text-center text-muted">No products found.</div>
        )}

        {catalogPages > 1 && (
          <div className="flex justify-center gap-2 pt-2">
            <button
              type="button"
              disabled={catalogPage <= 1}
              onClick={() => setCatalogPage((prev) => prev - 1)}
              className="rounded-xl border border-border px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-2 py-2 text-sm text-muted">Page {catalogPage} of {catalogPages}</span>
            <button
              type="button"
              disabled={catalogPage >= catalogPages}
              onClick={() => setCatalogPage((prev) => prev + 1)}
              className="rounded-xl border border-border px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </motion.div>
  );
}
