import { useState } from "react";

export function DeliveryEstimator() {
  const [pin, setPin] = useState("");
  const [estimate, setEstimate] = useState("");

  const check = () => {
    if (pin.length < 4) return;
    const days = 2 + (pin.charCodeAt(pin.length - 1) % 4);
    const date = new Date();
    date.setDate(date.getDate() + days);
    setEstimate(date.toDateString());
  };

  return (
    <div className="lux-card p-4 text-sm space-y-2">
      <h3 className="font-semibold">Delivery Information</h3>
      <div className="flex gap-2">
        <input className="lux-input" placeholder="Enter pincode" value={pin} onChange={(e) => setPin(e.target.value)} />
        <button type="button" onClick={check} className="btn-secondary">Check</button>
      </div>
      {estimate && <p className="text-xs text-muted">Estimated delivery by {estimate}</p>}
    </div>
  );
}
