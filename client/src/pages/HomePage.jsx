import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { HiAdjustments, HiX } from "react-icons/hi";
import { HeroCarousel } from "../components/ui/HeroCarousel.jsx";
import { ProductGrid } from "../components/ui/ProductGrid.jsx";
import { ProductGridSkeleton } from "../components/ui/LoadingSkeleton.jsx";
import { ProductCard } from "../components/products/ProductCard.jsx";
import { SectionHeader } from "../components/ui/SectionHeader.jsx";
import { HorizontalProductRow } from "../components/ui/HorizontalProductRow.jsx";
import api from "../api/client.js";

const quickFilters = ["All", "T-Shirts", "Jeans", "Shirts", "Pants"];

export function HomePage() {
  const [allProducts, setAllProducts] = useState([]);
  const [newDrops, setNewDrops] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([
      api.get("/products", { params: { limit: 40, sort: "newest" } }),
      api.get("/products", { params: { newDrop: true, limit: 12 } }),
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

  const filterMatch = useMemo(
    () => categories.find((c) => c.name.toLowerCase() === activeFilter.toLowerCase()),
    [activeFilter, categories],
  );

  const listingProducts = useMemo(() => {
    let data = [...allProducts];

    if (activeFilter !== "All") {
      data = data.filter((product) => {
        const categoryName = product.category?.name || "";
        const categoryId = product.category?._id || product.category;

        if (filterMatch) {
          return categoryId === filterMatch._id || categoryName.toLowerCase() === activeFilter.toLowerCase();
        }

        return categoryName.toLowerCase().includes(activeFilter.toLowerCase());
      });
    }

    if (sortBy === "price-low") data.sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sortBy === "price-high") data.sort((a, b) => (b.price || 0) - (a.price || 0));
    if (sortBy === "rating") data.sort((a, b) => (b.ratingsAverage || 0) - (a.ratingsAverage || 0));

    return data;
  }, [allProducts, activeFilter, sortBy, filterMatch]);

  return (
    <div className="space-y-12">
      <section>
        <HeroCarousel products={heroProducts} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {quickFilters.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setActiveFilter(item)}
                className={`rounded-full px-4 py-2 text-sm whitespace-nowrap border transition-all ${
                  activeFilter === item
                    ? "bg-accent text-primary border-accent"
                    : "bg-card text-white border-[#262626] hover:text-accent"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden rounded-xl border border-[#262626] bg-card p-2.5 text-white"
            aria-label="Open filters"
          >
            <HiAdjustments className="w-5 h-5" />
          </button>
        </div>
      </section>

      <section id="categories" className="space-y-4">
        <SectionHeader title="Categories" subtitle="Browse and filter without leaving home" />
        <div className="md:hidden -mx-4 px-4 overflow-x-auto">
          <div className="flex gap-3 pb-2">
            {categories.map((category) => (
              <button
                key={category._id}
                type="button"
                onClick={() => setActiveFilter(category.name)}
                className="min-w-[150px] rounded-xl overflow-hidden bg-card border border-[#262626] text-left"
              >
                <div className="aspect-[4/3] bg-[#262626]">
                  {category.image ? (
                    <img src={category.image} alt={category.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : null}
                </div>
                <p className="px-3 py-2 text-sm text-white">{category.name}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <button
              key={category._id}
              type="button"
              onClick={() => setActiveFilter(category.name)}
              className="rounded-xl overflow-hidden bg-card border border-[#262626] text-left hover:border-accent/40 transition-colors"
            >
              <div className="aspect-[5/3] bg-[#262626]">
                {category.image ? (
                  <img src={category.image} alt={category.name} className="w-full h-full object-cover" loading="lazy" />
                ) : null}
              </div>
              <p className="px-4 py-3 font-medium text-white">{category.name}</p>
            </button>
          ))}
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
          <ProductGrid className="grid-cols-2 lg:grid-cols-4">
            {trendingProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </ProductGrid>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <SectionHeader title="Shop All" subtitle="Dynamic listing with instant filters" />
          <select
            className="rounded-xl border border-[#262626] bg-card px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : listingProducts.length ? (
          <ProductGrid>
            {listingProducts.map((product) => (
              <motion.div key={product._id} layout>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </ProductGrid>
        ) : (
          <div className="rounded-xl bg-card border border-[#262626] py-10 text-center text-muted">
            No products found for this filter.
          </div>
        )}
      </section>

      {showMobileFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-primary/80" onClick={() => setShowMobileFilters(false)} aria-hidden />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-card border border-[#262626] p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Filters</h3>
              <button type="button" onClick={() => setShowMobileFilters(false)} className="text-muted">
                <HiX className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {quickFilters.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setActiveFilter(item);
                    setShowMobileFilters(false);
                  }}
                  className={`rounded-xl py-3 text-sm ${activeFilter === item ? "bg-accent text-primary" : "bg-primary text-white border border-[#262626]"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
