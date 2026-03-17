export function ProductVariants({
  sizes = [],
  colors = [],
  size,
  color,
  setSize,
  setColor,
}) {
  return (
    <div className="space-y-4 text-sm">
      {sizes.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-muted mb-2">
            Size
          </p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                  size === s
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-[#262626] text-muted hover:text-white hover:border-[#404040]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
      {colors.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-muted mb-2">
            Color
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                  color === c
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-[#262626] text-muted hover:text-white hover:border-[#404040]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
