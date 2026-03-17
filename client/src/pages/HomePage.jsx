import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import { ProductCard } from "../components/products/ProductCard.jsx";
import { ProductGrid } from "../components/ui/ProductGrid.jsx";
import { SectionHeader } from "../components/ui/SectionHeader.jsx";
import { ProductGridSkeleton } from "../components/ui/LoadingSkeleton.jsx";
import { HeroCarousel } from "../components/ui/HeroCarousel.jsx";
import { HorizontalProductRow } from "../components/ui/HorizontalProductRow.jsx";
import useUserPincode from "../api/useUserPincode.js";

const CATEGORIES = [
  { name: "Tees", slug: "tees", description: "Everyday essentials" },
  { name: "Joggers", slug: "joggers", description: "Comfort in motion" },
  { name: "Hoodies", slug: "hoodies", description: "Cozy layers" },
  { name: "All", slug: "", description: "View all" },
];

export function HomePage() {
  const [searchParams] = useSearchParams();
  const qFromUrl = searchParams.get("q") || "";
  const [featured, setFeatured] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [newDrops, setNewDrops] = useState([]);
  const [newDropsLoading, setNewDropsLoading] = useState(true);
  const [trending, setTrending] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [searchQ, setSearchQ] = useState(qFromUrl);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSent, setNewsletterSent] = useState(false);
  const [customerReviews, setCustomerReviews] = useState([]);
  const [customerReviewsLoading, setCustomerReviewsLoading] = useState(true);

  const pincode = useUserPincode();

  useEffect(() => {
    setSearchQ(qFromUrl);
  }, [qFromUrl]);

  useEffect(() => {
    if (qFromUrl.trim()) {
      setSearchLoading(true);
      api.get("/products/search", { params: { q: qFromUrl } }).then(({ data }) => {
        setSearchResults(data.items || []);
        setSearchLoading(false);
      }).catch(() => setSearchLoading(false));
      return;
    }
    setSearchResults([]);
  }, [qFromUrl]);

  useEffect(() => {
    setFeaturedLoading(true);
    api.get("/products", { params: { limit: 8, sort: "newest" } })
      .then(({ data }) => setFeatured(data.items || []))
      .finally(() => setFeaturedLoading(false));
  }, []);

  useEffect(() => {
    setNewDropsLoading(true);
    api.get("/products", { params: { onlyNewDrops: "true", limit: 4 } })
      .then(({ data }) => setNewDrops(data.items || []))
      .finally(() => setNewDropsLoading(false));
  }, []);

  useEffect(() => {
    setTrendingLoading(true);
    api.get("/products", { params: { sort: "rating", limit: 4 } })
      .then(({ data }) => setTrending(data.items || []))
      .finally(() => setTrendingLoading(false));
  }, []);

  // useEffect(() => {
  //   if (typeof window === "undefined" || !navigator.geolocation) return;

  //   if (!pincode) {
  //     navigator.geolocation.getCurrentPosition(
  //       async (pos) => {
  //         try {
  //           const { latitude, longitude } = pos.coords;

  //           const res = await fetch(
  //             `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
  //           );

  //           const data = await res.json();

  //           console.log("Location Data:", data);

  //           const code = data.address?.postcode;

  //           if (code) {
  //             setPincode(code);
  //             localStorage.setItem("noorfit_pincode", code);
  //           }
  //         } catch (err) {
  //           console.log("Location error:", err);
  //         }
  //       },
  //       (err) => console.log(err),
  //       { enableHighAccuracy: true }
  //     );
  //   }
  // }, [pincode]);

  useEffect(() => {
    setCustomerReviewsLoading(true);
    api.get("/products", { params: { limit: 5, sort: "rating" } })
      .then(({ data }) => {
        const items = data.items || [];
        const productIds = items.slice(0, 5).map((p) => p._id).filter(Boolean);
        if (productIds.length === 0) {
          setCustomerReviews([]);
          setCustomerReviewsLoading(false);
          return;
        }
        return Promise.all(
          productIds.map((id) =>
            api.get(`/reviews/${id}`).then((r) => r.data).catch(() => [])
          )
        );
      })
      .then((results) => {
        if (!results) return;
        const combined = results.flat().filter((r) => r && (r.comment || r.rating));
        const sorted = combined.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        setCustomerReviews(sorted.slice(0, 3));
      })
      .catch(() => setCustomerReviews([]))
      .finally(() => setCustomerReviewsLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQ.trim()) return;
    const params = new URLSearchParams();
    params.set("q", searchQ.trim());
    window.location.href = `/?${params.toString()}`;
  };

  const handleNewsletter = (e) => {
    e.preventDefault();
    setNewsletterSent(true);
    setNewsletterEmail("");
  };

  const showSearchResults = qFromUrl.trim().length > 0;

  const heroProducts = newDrops.length ? newDrops : featured;

  return (
    <div className="space-y-16 md:space-y-24">
      <section id="hero" className="space-y-4">
        <HeroCarousel products={heroProducts} />
        <form
          onSubmit={handleSearch}
          className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3 px-1"
        >
          <input
            type="search"
            placeholder="Search for products, categories, styles…"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            className="flex-1 rounded-2xl border border-[#262626] bg-primary px-5 py-3.5 text-base text-white placeholder-muted focus:outline-none focus:border-accent transition-colors"
          />
          <button
            type="submit"
            className="rounded-2xl bg-accent text-primary px-6 py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Search
          </button>
        </form>
        <p className="text-[11px] text-muted text-center">
          Deliver to{" "}
          <span className="text-white font-medium">
            {pincode ? pincode : "Detecting location..."}
          </span>
        </p>
      </section>

      {showSearchResults ? (
        <section>
          <SectionHeader
            title="Search results"
            subtitle={searchResults.length > 0 ? `"${qFromUrl}"` : "No products found"}
            action={
              <Link to="/" className="text-sm text-accent hover:underline">Clear search</Link>
            }
          />
          {searchLoading ? (
            <ProductGridSkeleton count={8} />
          ) : searchResults.length > 0 ? (
            <ProductGrid>
              {searchResults.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </ProductGrid>
          ) : (
            <div className="rounded-xl bg-card border border-[#262626] py-16 text-center">
              <p className="text-muted">No products found for &quot;{qFromUrl}&quot;.</p>
              <Link to="/shop" className="mt-3 inline-block text-accent text-sm font-medium hover:underline">Browse shop</Link>
            </div>
          )}
        </section>
      ) : (
        <>
          <section id="featured">
            <SectionHeader
              title="Featured pieces"
              subtitle="Curated for everyday comfort"
              action={
                <Link to="/shop" className="text-sm font-medium text-accent hover:underline">View all</Link>
              }
            />
            {featuredLoading ? (
              <ProductGridSkeleton count={8} />
            ) : featured.length > 0 ? (
              <>
                <div className="md:hidden">
                  <HorizontalProductRow products={featured} />
                </div>
                <div className="hidden md:block">
                  <ProductGrid>
                    {featured.map((p) => (
                      <ProductCard key={p._id} product={p} />
                    ))}
                  </ProductGrid>
                </div>
              </>
            ) : (
              <div className="rounded-xl bg-card border border-[#262626] py-12 text-center">
                <p className="text-muted">No featured products yet.</p>
              </div>
            )}
          </section>

          <section id="new-drops">
            <SectionHeader
              title="New drops"
              subtitle="Just landed"
              action={
                <Link to="/shop" className="text-sm font-medium text-accent hover:underline">View all</Link>
              }
            />
            {newDropsLoading ? (
              <ProductGridSkeleton count={4} />
            ) : newDrops.length > 0 ? (
              <>
                <div className="md:hidden">
                  <HorizontalProductRow products={newDrops} />
                </div>
                <div className="hidden md:block">
                  <ProductGrid>
                    {newDrops.map((p) => (
                      <ProductCard key={p._id} product={p} />
                    ))}
                  </ProductGrid>
                </div>
              </>
            ) : (
              <div className="rounded-xl bg-card border border-[#262626] py-12 text-center">
                <p className="text-muted">No new drops yet.</p>
              </div>
            )}
          </section>

          <section id="trending">
            <SectionHeader
              title="Trending"
              subtitle="Customer favorites"
              action={
                <Link to="/shop" className="text-sm font-medium text-accent hover:underline">View all</Link>
              }
            />
            {trendingLoading ? (
              <ProductGridSkeleton count={4} />
            ) : trending.length > 0 ? (
              <>
                <div className="md:hidden">
                  <HorizontalProductRow products={trending} />
                </div>
                <div className="hidden md:block">
                  <ProductGrid>
                    {trending.map((p) => (
                      <ProductCard key={p._id} product={p} />
                    ))}
                  </ProductGrid>
                </div>
              </>
            ) : (
              <div className="rounded-xl bg-card border border-[#262626] py-12 text-center">
                <p className="text-muted">No trending products yet.</p>
              </div>
            )}
          </section>
        </>
      )}

      <section id="categories">
        <SectionHeader title="Categories" subtitle="Explore by style" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug || "all"}
              to="/shop"
              className="group block rounded-xl bg-card border border-[#262626] p-6 md:p-8 hover:border-accent/50 hover:shadow-lg transition-all duration-300"
            >
              <span className="text-2xl md:text-3xl font-semibold text-white group-hover:text-accent transition-colors">
                {cat.name}
              </span>
              <p className="text-muted text-sm mt-1">{cat.description}</p>
            </Link>
          ))}
        </motion.div>
      </section>

      <section>
        <SectionHeader title="What customers say" subtitle="Real reviews from real people" />
        {customerReviewsLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl bg-card border border-[#262626] p-6 animate-pulse"
              >
                <div className="h-4 bg-[#262626] rounded w-full mb-3" />
                <div className="h-4 bg-[#262626] rounded w-3/4 mb-4" />
                <div className="h-3 bg-[#262626] rounded w-12" />
                <div className="h-3 bg-[#262626] rounded w-24 mt-2" />
              </div>
            ))}
          </motion.div>
        ) : customerReviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-xl bg-card border border-[#262626] py-12 text-center"
          >
            <p className="text-muted">No customer reviews yet. Be the first to share your experience.</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {customerReviews.map((r) => (
              <div
                key={r._id}
                className="rounded-xl bg-card border border-[#262626] p-6"
              >
                <p className="text-white text-sm leading-relaxed">
                  &quot;{r.comment || "Great product."}&quot;
                </p>
                <p className="text-accent text-xs mt-3">{"★".repeat(r.rating || 5)}</p>
                <p className="text-muted text-xs mt-1">
                  — {r.user?.name || "Customer"}
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </section>

      <section>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-card border border-[#262626] px-6 py-10 md:py-14 text-center"
        >
          <h2 className="text-xl md:text-2xl font-semibold text-white">
            Stay in the loop
          </h2>
          <p className="text-muted text-sm mt-2 max-w-md mx-auto">
            Get early access to new drops and exclusive offers.
          </p>
          {newsletterSent ? (
            <p className="text-accent text-sm mt-4">Thanks for subscribing.</p>
          ) : (
            <form onSubmit={handleNewsletter} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
              <input
                type="email"
                placeholder="Your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 rounded-xl border border-[#262626] bg-primary px-4 py-3 text-white placeholder-muted text-sm focus:outline-none focus:border-accent"
              />
              <button
                type="submit"
                className="rounded-xl bg-accent text-primary px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Subscribe
              </button>
            </form>
          )}
        </motion.div>
      </section>
    </div>
  );
}
