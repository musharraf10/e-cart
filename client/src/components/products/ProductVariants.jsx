export function ProductVariants({ variants = [], size, color, setSize, setColor }) {
  const sizes = [...new Set(variants.map((variant) => variant.size).filter(Boolean))];
  const colors = [...new Set(variants.map((variant) => variant.color).filter(Boolean))];

  const orderedSizes = ["S", "M", "L", "XL"];
  const sortedSizes = [...sizes].sort((a, b) => {
    const ai = orderedSizes.indexOf(a);
    const bi = orderedSizes.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  const hashToHue = (value) => {
    const str = String(value || "");
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) % 360;
    }
    return hash;
  };

  const isOutOfStockForSize = (s) => {
    const relevant = color
      ? variants.filter((v) => v.size === s && v.color === color)
      : variants.filter((v) => v.size === s);
    return relevant.reduce((sum, v) => sum + (v.stock || 0), 0) < 1;
  };

  const isOutOfStockForColor = (c) => {
    const relevant = size
      ? variants.filter((v) => v.color === c && v.size === size)
      : variants.filter((v) => v.color === c);
    return relevant.reduce((sum, v) => sum + (v.stock || 0), 0) < 1;
  };

  return (
    <div className="space-y-4 text-sm">
      {colors.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-muted mb-2">Color</p>
          <div className="flex flex-wrap gap-3">
            {colors.map((c) => {
              const out = isOutOfStockForColor(c);
              const hue = hashToHue(c);
              const selected = color === c;
              return (
                <button
                  key={c}
                  type="button"
                  disabled={out}
                  onClick={() => setColor(c)}
                  className={`h-12 px-3 rounded-xl border transition-all text-sm font-medium flex items-center gap-3 ${
                    selected
                      ? "border-[#a6c655] bg-[#a6c655]/10 text-[#a6c655]"
                      : "border-[#262626] text-muted hover:text-white"
                  } ${out ? "opacity-40 cursor-not-allowed" : "hover:border-accent/40"} `}
                >
                  <span
                    aria-hidden="true"
                    className="w-7 h-7 rounded-full border border-[#262626] shadow-sm inline-block"
                    style={{ backgroundColor: `hsl(${hue}, 70%, 50%)` }}
                  />
                  <span className="leading-tight">{c}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {sortedSizes.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-muted mb-2">Size</p>
          <div className="flex flex-wrap gap-3">
            {sortedSizes.map((s) => {
              const out = isOutOfStockForSize(s);
              const selected = size === s;
              return (
                <button
                  key={s}
                  type="button"
                  disabled={out}
                  onClick={() => setSize(s)}
                  className={`min-w-[64px] px-3 py-2 rounded-lg border transition-all text-sm font-medium ${
                    selected
                      ? "border-[#a6c655] bg-[#a6c655]/10 text-[#a6c655]"
                      : "border-[#262626] text-muted hover:text-white"
                  } ${out ? "opacity-40 cursor-not-allowed line-through" : ""}`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
