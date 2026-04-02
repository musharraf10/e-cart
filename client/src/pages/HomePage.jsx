import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { HiArrowNarrowRight } from "react-icons/hi";
import { motion } from "framer-motion";
import { ProductCard } from "../components/products/ProductCard.jsx";
import { ProductGridSkeleton } from "../components/ui/LoadingSkeleton.jsx";
import { SeoMeta } from "../components/seo/SeoMeta.jsx";
import { expandProductsByVariant } from "../utils/productVariants.js";
import {
  STALE_TIME_SECONDS,
  useGetCategoriesQuery,
  useGetProductsQuery,
} from "../store/apis/catalogApi.js";

const BRAND_VALUES = [
  "Made in India",
  "Ships worldwide in 48 hrs",
  "Built for daily wear",
];

const QUICK_REVIEWS = [
  {
    quote: "Clean look, premium feel. Exactly what I wanted.",
    author: "Aarav S.",
  },
  {
    quote: "Minimal but unique — every drop feels special.",
    author: "Sana K.",
  },
];

export function HomePage() {
  const [activeCategory, setActiveCategory] = useState("");

  const queryOptions = useMemo(
    () => ({ refetchOnMountOrArgChange: STALE_TIME_SECONDS }),
    [],
  );

  const categoriesQuery = useGetCategoriesQuery(undefined, queryOptions);
  const newCollectionQuery = useGetProductsQuery({ sort: "newest", limit: 8 }, queryOptions);

  const categories = categoriesQuery.data || [];
  const newCollection = expandProductsByVariant(newCollectionQuery.data?.items || []);

  const filteredCollection = useMemo(() => {
    if (!activeCategory) return newCollection;
    return newCollection.filter((product) => product.category?._id === activeCategory);
  }, [newCollection, activeCategory]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="space-y-10"
    >
      <SeoMeta
        title="NoorFit | Minimal Clothing Brand"
        description="A clean, unique clothing home screen with curated collections, monochrome style, and responsive shopping experience."
        canonicalUrl="/"
      />

      <section className="rounded-3xl border border-border-subtle bg-bg-secondary p-5 md:p-8">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-text-muted">
          <span>NOORFIT STUDIO</span>
          <span>EST. 2026</span>
        </div>

        <div className="mt-6 grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center rounded-full border border-border-subtle px-4 py-2 text-xs uppercase tracking-[0.18em] text-text-muted">
              The Crew Collection
            </div>
            <h1 className="text-3xl font-semibold leading-tight md:text-5xl">
              White &amp; black essentials for a bold everyday look.
            </h1>
            <p className="max-w-xl text-sm text-text-muted md:text-base">
              Minimal design. Strong identity. Designed for modern streetwear and comfort-first movement.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-text-primary px-5 py-3 text-sm font-semibold text-bg-primary transition hover:opacity-90"
            >
              Shop collection
              <HiArrowNarrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative mx-auto h-[260px] w-full max-w-sm">
            <div className="absolute left-4 top-6 h-44 w-32 rounded-2xl border border-border-subtle bg-bg-primary" />
            <div className="absolute left-1/2 top-0 h-56 w-36 -translate-x-1/2 rounded-2xl border border-text-primary bg-text-primary/5" />
            <div className="absolute right-4 top-6 h-44 w-32 rounded-2xl border border-border-subtle bg-bg-primary" />
            <div className="absolute inset-x-8 bottom-0 rounded-2xl border border-border-subtle bg-bg-primary/80 px-4 py-3 text-center text-xs uppercase tracking-[0.16em] text-text-muted">
              Monochrome • Responsive • Unique
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Collections</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((category) => (
            <button
              key={category._id}
              type="button"
              onClick={() => setActiveCategory((prev) => (prev === category._id ? "" : category._id))}
              className={`rounded-2xl border px-4 py-4 text-sm font-medium transition ${
                activeCategory === category._id
                  ? "border-text-primary bg-text-primary text-bg-primary"
                  : "border-border-subtle bg-bg-secondary text-text-primary hover:border-text-primary"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {BRAND_VALUES.map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-border-subtle bg-bg-secondary px-4 py-3 text-center text-xs uppercase tracking-[0.14em] text-text-muted"
          >
            {item}
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">New Collection</p>
            <h2 className="mt-2 text-2xl font-semibold">Style under ₹2000</h2>
          </div>
          <Link to="/shop" className="text-sm text-text-muted underline underline-offset-4">
            View all
          </Link>
        </div>

        {newCollectionQuery.isLoading ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {filteredCollection.slice(0, 8).map((product) => (
              <ProductCard
                key={product.variantKey || `${product._id}-${product.displayColor || "default"}`}
                product={product}
              />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-border-subtle bg-bg-secondary p-5 md:p-7">
        <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div className="space-y-3 text-sm text-text-muted">
            <p>100% comfortable fabrics</p>
            <p>Gender neutral fits</p>
            <p>Limited-run silhouettes</p>
          </div>
          <div className="mx-auto h-24 w-24 rounded-full border border-text-primary" />
          <form className="flex flex-col gap-3 sm:flex-row md:justify-end" onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              className="h-11 rounded-full border border-border-subtle bg-bg-primary px-4 text-sm focus-ring"
            />
            <button
              type="submit"
              className="h-11 rounded-full bg-text-primary px-5 text-sm font-semibold text-bg-primary"
            >
              Join
            </button>
          </form>
        </div>
      </section>

      <section className="space-y-3 pb-4">
        <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Reviews</p>
        <div className="grid gap-3 md:grid-cols-2">
          {QUICK_REVIEWS.map((review) => (
            <article key={review.author} className="rounded-2xl border border-border-subtle bg-bg-secondary p-4">
              <p className="text-sm">“{review.quote}”</p>
              <p className="mt-3 text-xs uppercase tracking-[0.12em] text-text-muted">{review.author}</p>
            </article>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
