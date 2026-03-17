export function ProductSpecs({ product }) {
  const specs = {
    Material: product.material || "Premium cotton blend",
    "Fabric type": product.fabricType || "Knitted",
    Fit: product.fit || "Regular fit",
    Pattern: product.pattern || "Solid",
    Occasion: product.occasion || "Casual",
    Brand: "NoorFit",
  };

  return (
    <div className="rounded-xl bg-card border border-[#262626] p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Specifications</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        {Object.entries(specs).map(([key, value]) => (
          <div
            key={key}
            className="rounded-lg border border-[#262626] px-4 py-3"
          >
            <p className="text-xs text-muted uppercase tracking-wider">{key}</p>
            <p className="text-white font-medium mt-0.5">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
