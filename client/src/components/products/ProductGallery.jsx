import { useMemo, useState } from "react";
import { motion } from "framer-motion";

export function ProductGallery({ images = [], alt }) {
  const safeImages = useMemo(() => images.filter(Boolean), [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [touchStart, setTouchStart] = useState(null);

  const active = safeImages[activeIndex];

  const onTouchStart = (e) => setTouchStart(e.changedTouches[0].clientX);
  const onTouchEnd = (e) => {
    if (touchStart === null) return;
    const delta = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(delta) > 40) {
      if (delta < 0)
        setActiveIndex((i) => Math.min(safeImages.length - 1, i + 1));
      if (delta > 0) setActiveIndex((i) => Math.max(0, i - 1));
    }
    setTouchStart(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div
        className="rounded-xl bg-card border border-[#262626] overflow-hidden aspect-[4/5] cursor-zoom-in flex items-center justify-center"
        onClick={() => setZoomed((z) => !z)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {active ? (
          <img
            src={active}
            alt={alt}
            loading="eager"
            className={`w-full h-full object-cover transition-transform duration-300 ${zoomed ? "scale-125" : "scale-100"}`}
          />
        ) : (
          <div className="text-muted text-sm">No image</div>
        )}
      </div>
      {safeImages.length > 1 && (
        <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
          {safeImages.map((src, idx) => (
            <button
              key={src + idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                idx === activeIndex
                  ? "border-accent"
                  : "border-[#262626] hover:border-[#404040]"
              }`}
            >
              <img
                src={src}
                alt={`${alt} ${idx + 1}`}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
