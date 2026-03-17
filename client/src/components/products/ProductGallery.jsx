import { useMemo, useState } from "react";
import { motion } from "framer-motion";

export function ProductGallery({ images = [], alt }) {
  const safeImages = useMemo(() => images.filter(Boolean), [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const active = safeImages[activeIndex];

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div
        className="rounded-xl bg-card border border-[#262626] overflow-hidden aspect-[4/5] cursor-zoom-in flex items-center justify-center group"
        onMouseMove={handleMouseMove}
      >
        {active ? (
          <img
            src={active}
            alt={alt}
            loading="eager"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-125"
            style={{ transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }}
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
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${idx === activeIndex ? "border-accent" : "border-[#262626]"}`}
            >
              <img src={src} alt={`${alt} ${idx + 1}`} loading="lazy" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
