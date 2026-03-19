import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { HeroCarousel } from "../components/ui/HeroCarousel.jsx";
import { ProductGrid } from "../components/ui/ProductGrid.jsx";
import { ProductGridSkeleton } from "../components/ui/LoadingSkeleton.jsx";
import { ProductCard } from "../components/products/ProductCard.jsx";
import { SectionHeader } from "../components/ui/SectionHeader.jsx";
import { HorizontalProductRow } from "../components/ui/HorizontalProductRow.jsx";
import api from "../api/client.js";

export function HomePage() {
  const [allProducts, setAllProducts] = useState([]);
  const [newDrops, setNewDrops] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([
      api.get("/products", { params: { limit: 40, sort: "newest" } }),
      api.get("/products", { params: { onlyNewDrops: true, limit: 12 } }),
      api.get("/products", { params: { sort: "rating", limit: 8 } }),
      api.get("/categories"),
    ])
      .then(([allRes, dropRes, trendingRes, categoryRes]) => {
        if (!mounted) return;
        setAllProducts(allRes.data.items || []);
        setNewDrops(dropRes.data.items || []);
        setTrendingProducts(trendingRes.data.items || []);
        setCategories(categoryRes.data || []);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const heroProducts = useMemo(() => allProducts.slice(0, 4), [allProducts]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      className="space-y-12"
    >
      <section>
        <HeroCarousel products={heroProducts} />
      </section>

      <section id="categories" className="space-y-4">
        <SectionHeader title="Categories" subtitle="Browse by category" />
        <div className="-mx-4 overflow-x-auto max-w-full">
          <div className="flex w-max gap-3 px-4 pb-2">
            {categories.map((category) => (
              <div
                key={category._id}
                className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-card border border-[#262626] text-left flex-shrink-0"
              >
                {category.image ? (
                  <>
                    <img
                      src={category.image}
                      alt={category.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-[#262626]" />
                )}
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <p className="text-sm font-semibold text-white line-clamp-1">
                    {category.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <SectionHeader title="New Drops" subtitle="Freshly added styles" />
        {loading ? <ProductGridSkeleton count={4} /> : <HorizontalProductRow products={newDrops} />}
      </section>

      <section>
        <SectionHeader title="Trending Products" subtitle="Most loved by shoppers" />
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <ProductGrid>
            {trendingProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </ProductGrid>
        )}
      </section>

      <section className="space-y-4">
        <SectionHeader title="All Products" subtitle="Explore everything in NoorFit" />
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : allProducts.length ? (
          <ProductGrid>
            {allProducts.map((product) => (
              <motion.div key={product._id} layout>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </ProductGrid>
        ) : (
          <div className="rounded-xl bg-card border border-[#262626] py-10 text-center text-muted">
            No products found.
          </div>
        )}
      </section>
    </motion.div>
  );
}
