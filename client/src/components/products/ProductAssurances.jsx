const assurances = [
  ["Original", "100% Original Product"],
  ["Returns", "Easy 7-Day Returns"],
  ["Secure", "Secure Payments"],
  ["Delivery", "Fast Delivery"],
];

export function ProductAssurances() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {assurances.map(([label, text]) => (
        <div
          key={text}
          className="rounded-xl bg-card border border-[#262626] px-4 py-3 flex items-center gap-3 text-sm"
        >
          <span className="text-accent font-semibold text-xs uppercase tracking-wider">
            {label}
          </span>
          <span className="text-muted">{text}</span>
        </div>
      ))}
    </div>
  );
}
