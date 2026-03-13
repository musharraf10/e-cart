export function ProductVariants({ sizes = [], colors = [], size, color, setSize, setColor }) {
  return (
    <div className="space-y-3 text-sm">
      {sizes.length > 0 && (
        <div>
          <p className="text-xs uppercase text-gray-500 mb-1">Size</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`px-3 py-1 rounded-full border text-xs ${size === s ? "bg-gray-900 text-white border-gray-900" : "border-gray-300"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
      {colors.length > 0 && (
        <div>
          <p className="text-xs uppercase text-gray-500 mb-1">Color</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`px-3 py-1 rounded-full border text-xs ${color === c ? "bg-gray-900 text-white border-gray-900" : "border-gray-300"}`}
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
