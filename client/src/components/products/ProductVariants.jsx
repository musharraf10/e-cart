import { useMemo, useState } from "react";
import { getColorSwatch } from "../../utils/productVariants.js";
import { SizeChartModal } from "./SizeChartModal.jsx";

export function ProductVariants({
  variants = [],
  size,
  color,
  setSize,
  setColor,
  sizeChart,
}) {
  const [showSizeChart, setShowSizeChart] = useState(false);
  const allSizes = useMemo(
    () => [...new Set(variants.map((v) => v.size).filter(Boolean))],
    [variants],
  );

  const colors = useMemo(
    () => [...new Set(variants.map((v) => v.color).filter(Boolean))],
    [variants],
  );

  const orderedSizes = ["S", "M", "L", "XL", "XXL", "XXXL"];

  const sortedSizes = useMemo(() => {
    return [...allSizes].sort((a, b) => {
      const ai = orderedSizes.indexOf(a);
      const bi = orderedSizes.indexOf(b);

      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;

      return ai - bi;
    });
  }, [allSizes]);

  const isOutOfStockForSize = (selectedSize) => {
    if (!color) return false;

    const relevant = variants.filter(
      (variant) => variant.size === selectedSize && variant.color === color,
    );

    return relevant.length === 0 || relevant.reduce((sum, variant) => sum + (variant.stock || 0), 0) < 1;
  };

  const isOutOfStockForColor = (selectedColor) => {
    const relevant = variants.filter((variant) => variant.color === selectedColor);
    return relevant.reduce((sum, variant) => sum + (variant.stock || 0), 0) < 1;
  };

  return (
    <div className="space-y-5 text-sm">
      {colors.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-[11px] uppercase tracking-wider text-muted">Color</p>
            <p className="text-xs text-muted">{color || "Select a color"}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {colors.map((variantColor) => {
              const out = isOutOfStockForColor(variantColor);
              const selected = color === variantColor;

              return (
                <button
                  key={variantColor}
                  type="button"
                  disabled={out}
                  onClick={() => {
                    setColor(variantColor);

                    const first = variants.find(
                      (variant) => variant.color === variantColor && variant.stock > 0,
                    );

                    setSize((currentSize) => {
                      const stillValid = variants.some(
                        (variant) =>
                          variant.color === variantColor &&
                          variant.size === currentSize &&
                          Number(variant.stock || 0) > 0,
                      );
                      return stillValid ? currentSize : (first?.size || "");
                    });
                  }}
                  className={`group flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-all ${selected
                    ? "border-[#a6c655] bg-[#a6c655]/10 text-[#a6c655]"
                    : "border-[#262626] text-muted hover:text-white"
                  } ${out ? "cursor-not-allowed opacity-40" : "hover:border-[#a6c655]/40"}`}
                >
                  <span
                    className={`h-4 w-4 rounded-full border ${selected ? "border-white/70" : "border-[#262626]"}`}
                    style={{ backgroundColor: getColorSwatch(variantColor) }}
                  />
                  <span>{variantColor}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {sortedSizes.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-[11px] uppercase tracking-wider text-muted">Size</p>
            <button
              type="button"
              onClick={() => setShowSizeChart(true)}
              className="text-xs font-medium text-[#9fc9ff] hover:text-white"
            >
              View size chart
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {sortedSizes.map((variantSize) => {
              const out = isOutOfStockForSize(variantSize);
              const selected = size === variantSize;

              return (
                <button
                  key={variantSize}
                  type="button"
                  disabled={out}
                  onClick={() => {
                    setSize((currentSize) => (currentSize === variantSize ? "" : variantSize));
                  }}
                  className={`min-w-[60px] rounded-md border px-2 py-1.5 text-xs font-medium transition-all ${selected
                    ? "border-[#a6c655] bg-[#a6c655]/10 text-[#a6c655]"
                    : "border-[#262626] text-muted hover:text-white"
                  } ${out ? "cursor-not-allowed opacity-40 line-through" : ""}`}
                >
                  {variantSize}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <SizeChartModal
        open={showSizeChart}
        onClose={() => setShowSizeChart(false)}
        sizeChart={sizeChart}
      />
    </div>
  );
}
