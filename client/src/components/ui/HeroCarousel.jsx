import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export function HeroCarousel({ products = [] }) {
  const slides = useMemo(
    () =>
      (products || [])
        .filter((p) => p && (p.images?.[0] || p.name))
        .slice(0, 4)
        .map((p) => ({
          id: p._id,
          title: p.name,
          subtitle: p.category?.name || "New drop",
          image: p.images?.[0],
          href: `/product/${p.slug}`,
        })),
    [products],
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!slides.length) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      7000,
    );
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) {
    return null;
  }

  const active = slides[index];

  return (
    <section className="relative rounded-2xl overflow-hidden bg-card border border-[#262626]">
      {active.image && (
        <div className="absolute inset-0">
          <img
            src={active.image}
            alt={active.title}
            loading="lazy"
            className="w-full h-full object-cover opacity-40 md:opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary/40" />
        </div>
      )}

      <div className="relative z-10 px-6 py-10 md:py-14 lg:py-16 max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.25em] text-muted mb-2">
          NoorFit · Crafted for Comfort. Designed for Life.
        </p>
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.4 }}
            className="space-y-3 md:space-y-4"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white tracking-tight leading-tight">
              {active.title}
            </h1>
            <p className="text-muted text-sm md:text-base">
              {active.subtitle || "Elevated essentials for every day."}
            </p>
            <Link
              to={active.href}
              className="inline-flex items-center rounded-xl bg-accent text-primary px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity mt-2"
            >
              View product
            </Link>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center gap-2 mt-6">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index
                  ? "w-6 bg-accent"
                  : "w-2 bg-[#262626] hover:bg-[#404040]"
              }`}
              aria-label={`Go to banner ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

