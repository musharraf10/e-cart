import { useEffect, useMemo, useState } from "react";
import { HeroCarousel } from "../components/ui/HeroCarousel.jsx";
import { HorizontalProductRow } from "../components/ui/HorizontalProductRow.jsx";
import { ProductGridSkeleton } from "../components/ui/LoadingSkeleton.jsx";
import { CategoryChips } from "../features/home/components/CategoryChips.jsx";
import { NewCollectionGrid } from "../features/home/components/NewCollectionGrid.jsx";
import { ReviewsSection } from "../features/home/components/ReviewsSection.jsx";
import { fetchHomeSections } from "../features/home/api/homeSections.js";
import api from "../api/client.js";
import { expandProductsByVariant } from "../utils/productVariants.js";

export function HomePage() {
  const [allProducts, setAllProducts] = useState([]);
  const [newDrops, setNewDrops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sections, setSections] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      const [allRes, newRes, categoriesRes, sectionRes] = await Promise.all([
        api.get("/products", { params: { limit: 36, sort: "newest" } }),
        api.get("/products", { params: { onlyNewDrops: true, limit: 8 } }),
        api.get("/categories"),
        fetchHomeSections(),
      ]);

      if (!mounted) return;
      setAllProducts(allRes.data.items || []);
      setNewDrops(newRes.data.items || []);
      setCategories(categoriesRes.data || []);
      setSections(sectionRes || []);
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const expandedAll = useMemo(() => expandProductsByVariant(allProducts), [allProducts]);
  const expandedNew = useMemo(() => expandProductsByVariant(newDrops), [newDrops]);
  const heroProducts = expandedAll.slice(0, 6);

  const filteredProducts = useMemo(() => {
    if (!activeCategory) return expandedAll;
    return expandedAll.filter((item) => {
      const slug = item.category?.slug;
      return slug === activeCategory;
    });
  }, [activeCategory, expandedAll]);

  const enabledSections = useMemo(() => {
    return (sections || [])
      .filter((item) => item.isActive)
      .sort((a, b) => a.order - b.order);
  }, [sections]);

  const sectionMap = {
    hero: <HeroCarousel products={heroProducts} />,
    categories: <CategoryChips categories={categories} active={activeCategory} onSelect={setActiveCategory} />,
    products: (
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Products</h2>
        {loading ? <ProductGridSkeleton count={4} /> : <HorizontalProductRow products={filteredProducts.slice(0, 12)} />}
      </section>
    ),
    newCollection: <NewCollectionGrid products={expandedNew.length ? expandedNew : filteredProducts.slice(0, 8)} />,
    reviews: <ReviewsSection />,
  };

  return (
    <div className="space-y-6 pb-4">
      {enabledSections.map((section) => (
        <div key={section.key}>{sectionMap[section.key] || null}</div>
      ))}
    </div>
  );
}
