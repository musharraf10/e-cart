import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

export function HeroCarousel({ products = [] }) {
  const slides = useMemo(
    () =>
      (products || []).slice(0, 6).map((item) => ({
        id: item.variantKey || `${item._id}-${item.displayColor || "default"}`,
        title: item.name,
        image: item.displayImage || item.images?.[0],
        href: item.routeTo || `/product/${item.slug}`,
      })),
    [products],
  );

  const [active, setActive] = useState(0);

  if (!slides.length) return null;

  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-semibold tracking-tight">New arrivals</h1>
      <div className="-mx-4 overflow-x-auto px-4 snap-x snap-mandatory">
        <div className="flex gap-3 items-stretch w-max pb-2">
          {slides.map((slide, index) => (
            <Link
              key={slide.id}
              to={slide.href}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              className={`snap-center relative w-[70vw] max-w-[420px] min-w-[70vw] md:min-w-[540px] overflow-hidden rounded-3xl border border-border-subtle bg-bg-secondary transition-transform duration-300 ${active === index ? "scale-100" : "scale-[0.94]"
                }`}
            >
              {slide.image ? (
                <img
                  src={slide.image}
                  alt={slide.title}
                  loading="lazy"
                  className="h-[46vw] max-h-80 min-h-52 w-full object-cover"
                />
              ) : (
                <div className="h-56 w-full bg-bg-primary" />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg-primary/80 to-transparent p-4">
                <p className="text-sm font-medium text-text-primary">{slide.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
