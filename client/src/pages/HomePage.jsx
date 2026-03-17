import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeroCarousel } from "../components/ui/HeroCarousel.jsx";
import { ProductGrid } from "../components/ui/ProductGrid.jsx";
import { ProductGridSkeleton } from "../components/ui/LoadingSkeleton.jsx";
import { ProductCard } from "../components/products/ProductCard.jsx";
import { SectionHeader } from "../components/ui/SectionHeader.jsx";
import api from "../api/client.js";

export function HomePage() {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loadingAll, setLoadingAll] = useState(true);
  const [loadingFiltered, setLoadingFiltered] = useState(false);

  useEffect(() => {
    setLoadingAll(true);
    api
      .get("/products", { params: { limit: 16, sort: "newest" } })
      .then(({ data }) => setAllProducts(data.items || []))
      .finally(() => setLoadingAll(false));
  }, []);

  useEffect(() => {
    api.get("/categories").then(({ data }) => setCategories(data || [])).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (activeCategory === "all") {
      setFilteredProducts([]);
      return;
    }

    setLoadingFiltered(true);
    api
      .get("/products", { params: { category: activeCategory, limit: 16 } })
      .then(({ data }) => setFilteredProducts(data.items || []))
      .finally(() => setLoadingFiltered(false));
  }, [activeCategory]);

  const heroProducts = useMemo(() => allProducts.slice(0, 4), [allProducts]);

  return (
    <div className="space-y-14">
      <section>
        <HeroCarousel products={heroProducts} />
      </section>

      <section id="categories" className="space-y-4">
        <SectionHeader title="Categories" subtitle="Pick a category to filter instantly" />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`rounded-full px-4 py-2 text-sm transition-colors ${activeCategory === "all" ? "bg-accent text-primary" : "bg-card text-white hover:text-accent"}`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              type="button"
              onClick={() => setActiveCategory(category._id)}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${activeCategory === category._id ? "bg-accent text-primary" : "bg-card text-white hover:text-accent"}`}
            >
              {category.name.toUpperCase()}
            </button>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="All Products" subtitle="Main shopping feed" />
        {loadingAll ? (
          <ProductGridSkeleton count={8} />
        ) : allProducts.length > 0 ? (
          <ProductGrid>
            {allProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </ProductGrid>
        ) : (
          <div className="rounded-xl bg-card border border-[#262626] py-12 text-center text-muted">
            No products available right now.
          </div>
        )}
      </section>

      <AnimatePresence mode="wait">
        {activeCategory !== "all" && (
          <motion.section
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <SectionHeader
              title="Filtered Products"
              subtitle={categories.find((c) => c._id === activeCategory)?.name || "Selected category"}
            />
            {loadingFiltered ? (
              <ProductGridSkeleton count={8} />
            ) : filteredProducts.length > 0 ? (
              <ProductGrid>
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </ProductGrid>
            ) : (
              <div className="rounded-xl bg-card border border-[#262626] py-12 text-center text-muted">
                No products found in this category.
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
