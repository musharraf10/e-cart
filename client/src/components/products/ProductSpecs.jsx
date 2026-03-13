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
    <div className="bg-white rounded-xl shadow-sm p-4 text-sm">
      <h3 className="font-semibold mb-3">Specifications</h3>
      <div className="grid sm:grid-cols-2 gap-2">
        {Object.entries(specs).map(([key, value]) => (
          <div key={key} className="border rounded-lg px-3 py-2">
            <p className="text-xs text-gray-500">{key}</p>
            <p className="font-medium">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
