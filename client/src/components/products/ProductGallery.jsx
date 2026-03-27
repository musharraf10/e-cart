import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";

export function ProductGallery({ images = [], alt, variantKey }) {
  const safeImages = useMemo(() => images.filter(Boolean), [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [transitionKey, setTransitionKey] = useState(0);
  const touchStartX = useRef(null);
  const touchDeltaX = useRef(0);

  const imagesSignature = useMemo(() => safeImages.join("|"), [safeImages]);

  const active = safeImages[activeIndex];

  useEffect(() => {
    // Reset selected image when switching colors (or when images change).
    setActiveIndex(0);
    setTransitionKey((k) => k + 1);
  }, [variantKey, imagesSignature]);

  const goPrev = () => {
    setActiveIndex((index) => (index - 1 + safeImages.length) % safeImages.length);
  };

  const goNext = () => {
    setActiveIndex((index) => (index + 1) % safeImages.length);
  };

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches?.[0]?.clientX ?? null;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (event) => {
    if (touchStartX.current == null) return;
    const currentX = event.touches?.[0]?.clientX ?? touchStartX.current;
    touchDeltaX.current = currentX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (safeImages.length < 2) return;
    const threshold = 45;
    if (touchDeltaX.current <= -threshold) goNext();
    if (touchDeltaX.current >= threshold) goPrev();
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <motion.div
        key={transitionKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="relative min-h-[420px] sm:min-h-[520px] rounded-[20px] border border-[#262626] overflow-hidden bg-[#0f0f0f] flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {active ? (
          <img
            src={active}
            alt={alt}
            loading="eager"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="text-muted text-sm">No image</div>
        )}

        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-black/30 p-2 text-white"
              aria-label="Previous image"
            >
              <HiArrowLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-black/30 p-2 text-white"
              aria-label="Next image"
            >
              <HiArrowRight className="h-5 w-5" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-2">
              <div className="flex items-center gap-2">
                {safeImages.map((_, idx) => (
                  <button
                    key={`dot-${idx}`}
                    type="button"
                    aria-label={`Go to image ${idx + 1}`}
                    onClick={() => setActiveIndex(idx)}
                    className={`h-2.5 rounded-full transition-all ${idx === activeIndex ? "w-6 bg-white" : "w-2.5 bg-white/50"}`}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
