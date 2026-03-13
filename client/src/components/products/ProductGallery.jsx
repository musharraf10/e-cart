import { useMemo, useState } from "react";

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
      if (delta < 0) setActiveIndex((i) => Math.min(safeImages.length - 1, i + 1));
      if (delta > 0) setActiveIndex((i) => Math.max(0, i - 1));
    }
    setTouchStart(null);
  };

  return (
    <div className="space-y-3">
      <div
        className="bg-white rounded-2xl overflow-hidden shadow-sm aspect-[4/5] cursor-zoom-in"
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
          <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">No image</div>
        )}
      </div>

      {safeImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {safeImages.map((src, idx) => (
            <button
              key={src + idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`aspect-square rounded-lg overflow-hidden border ${idx === activeIndex ? "border-gray-900" : "border-gray-200"}`}
            >
              <img src={src} alt={`${alt} ${idx + 1}`} loading="lazy" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
