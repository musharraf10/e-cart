const assurances = [["✅", "100% Original Product"],["↩️", "Easy 7-Day Returns"],["🔒", "Secure Payments"],["🚚", "Fast Delivery"]];

export function ProductAssurances() {
  return (
    <div className="grid sm:grid-cols-2 gap-2">
      {assurances.map(([icon, text]) => (
        <div key={text} className="lux-card p-3 text-sm flex items-center gap-2 hover:scale-[1.02] transition-all">
          <span>{icon}</span><span>{text}</span>
        </div>
      ))}
    </div>
  );
}
