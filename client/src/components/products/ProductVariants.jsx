export function ProductVariants({ variants = [], size, color, setSize, setColor }) {
  const sizes = [...new Set(variants.map((variant) => variant.size).filter(Boolean))];
  const colors = [...new Set(variants.map((variant) => variant.color).filter(Boolean))];

  const sizeStock = sizes.reduce((acc, s) => {
    acc[s] = variants
      .filter((variant) => variant.size === s)
      .reduce((sum, variant) => sum + (variant.stock || 0), 0);
    return acc;
  }, {});

  const colorStock = colors.reduce((acc, c) => {
    const relevant = size
      ? variants.filter((variant) => variant.size === size && variant.color === c)
      : variants.filter((variant) => variant.color === c);
    acc[c] = relevant.reduce((sum, variant) => sum + (variant.stock || 0), 0);
    return acc;
  }, {});

  return (
    <div className="space-y-4 text-sm">
      {sizes.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-muted mb-2">Size</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => {
              const out = (sizeStock[s] || 0) < 1;
              return (
                <button
                  key={s}
                  type="button"
                  disabled={out}
                  onClick={() => setSize(s)}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                    size === s
                      ? "border-accent bg-accent/10 text-accent"
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

      {colors.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-muted mb-2">Color</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => {
              const out = (colorStock[c] || 0) < 1;
              return (
                <button
                  key={c}
                  type="button"
                  disabled={out}
                  onClick={() => setColor(c)}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                    color === c
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-[#262626] text-muted hover:text-white"
                  } ${out ? "opacity-40 cursor-not-allowed" : ""}`}
                >
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
