import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

export function ProductGallery({ images = [], alt, variantKey }) {
  const safeImages = useMemo(() => images.filter(Boolean), [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [transitionKey, setTransitionKey] = useState(0);

  const imagesSignature = useMemo(() => safeImages.join("|"), [safeImages]);

  const active = safeImages[activeIndex];

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  useEffect(() => {
    // Reset selected image when switching colors (or when images change).
    setActiveIndex(0);
    setZoomPos({ x: 50, y: 50 });
    setTransitionKey((k) => k + 1);
  }, [variantKey, imagesSignature]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <motion.div
        key={transitionKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.18 }}
        className="rounded-xl bg-[#171717] border border-[#262626] overflow-hidden cursor-zoom-in flex items-center justify-center group p-4"
        style={{ maxHeight: "500px" }}
        onMouseMove={handleMouseMove}
      >
        {active ? (
          <img
            src={active}
            alt={alt}
            loading="eager"
            className="w-full max-h-[320px] md:max-h-[500px] object-contain transition-transform duration-300 group-hover:scale-125"
            style={{ transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }}
          />
        ) : (
          <div className="text-muted text-sm">No image</div>
        )}
      </motion.div>
      {safeImages.length > 1 && (
        <div className="flex flex-wrap gap-3">
          {safeImages.map((src, idx) => (
            <button
              key={src + idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`w-[60px] h-[60px] rounded-lg overflow-hidden border-2 transition-colors ${idx === activeIndex ? "border-[#d4af37]" : "border-[#262626]"}`}
            >
              <img src={src} alt={`${alt} ${idx + 1}`} loading="lazy" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
