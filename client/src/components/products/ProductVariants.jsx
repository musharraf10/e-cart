import { useMemo } from "react";

export function ProductVariants({
  variants = [],
  size,
  color,
  setSize,
  setColor,
}) {
  const allSizes = useMemo(
    () => [...new Set(variants.map((v) => v.size).filter(Boolean))],
    [variants]
  );

  const colors = useMemo(
    () => [...new Set(variants.map((v) => v.color).filter(Boolean))],
    [variants]
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

  // 🎨 REAL COLOR MAPPING (IMPORTANT)
  const colorMap = {
    black: "#000000",
    white: "#ffffff",
    blue: "#1e40af",
    red: "#dc2626",
    green: "#16a34a",
    yellow: "#eab308",
    gray: "#6b7280",
    grey: "#6b7280",
    navy: "#0f172a",
    maroon: "#7f1d1d",
    pink: "#ec4899",
    orange: "#f97316",
    purple: "#9333ea",
  };

  const getColorCode = (c) => {
    return colorMap[c?.toLowerCase()] || "#888888";
  };

  // ✅ Size stock logic
  const isOutOfStockForSize = (s) => {
    if (!color) return false;

    const relevant = variants.filter(
      (v) => v.size === s && v.color === color
    );

    return (
      relevant.length === 0 ||
      relevant.reduce((sum, v) => sum + (v.stock || 0), 0) < 1
    );
  };

  // ✅ Color stock logic
  const isOutOfStockForColor = (c) => {
    const relevant = variants.filter((v) => v.color === c);
    return relevant.reduce((sum, v) => sum + (v.stock || 0), 0) < 1;
  };

  return (
    <div className="space-y-5 text-sm">

      {/* ================= SIZE FIRST ================= */}
      {sortedSizes.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted mb-2">
            Size
          </p>

          <div className="flex flex-wrap gap-2">
            {sortedSizes.map((s) => {
              const out = isOutOfStockForSize(s);
              const selected = size === s;

              return (
                <button
                  key={s}
                  type="button"
                  disabled={out}
                  onClick={() => {
                    if (size === s) {
                      setSize("");
                    } else {
                      setSize(s);
                    }
                  }}
                  className={`min-w-[60px] px-2 py-1.5 rounded-md border text-xs font-medium transition-all ${selected
                    ? "border-[#a6c655] bg-[#a6c655]/10 text-[#a6c655]"
                    : "border-[#262626] text-muted hover:text-white"
                    } ${out
                      ? "opacity-40 cursor-not-allowed line-through"
                      : ""
                    }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= COLOR ================= */}
      {colors.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted mb-2">
            Color
          </p>

          <div className="flex flex-wrap gap-3">
            {colors.map((c) => {
              const out = isOutOfStockForColor(c);
              const selected = color === c;

              return (
                <button
                  key={c}
                  type="button"
                  disabled={out}
                  onClick={() => {
                    setColor(c);

                    const first = variants.find(
                      (v) => v.color === c && v.stock > 0
                    );

                    setSize(first?.size || "");
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all ${selected
                    ? "border-[#a6c655] bg-[#a6c655]/10 text-[#a6c655]"
                    : "border-[#262626] text-muted hover:text-white"
                    } ${out
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:border-[#a6c655]/40"
                    }`}
                >
                  {/* ✅ REAL COLOR DOT */}
                  <span
                    className="w-4 h-4 rounded-full border border-[#262626]"
                    style={{ backgroundColor: getColorCode(c) }}
                  />

                  {c}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}