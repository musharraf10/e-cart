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
    <div className="rounded-xl bg-card border border-[#262626] p-6 space-y-3">
      <h3 className="font-semibold text-white">Delivery Information</h3>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-xl border border-[#262626] bg-primary px-4 py-2.5 text-white text-sm placeholder-muted focus:outline-none focus:border-accent"
          placeholder="Enter pincode"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />
        <button
          type="button"
          onClick={check}
          className="rounded-xl border border-[#262626] px-4 py-2.5 text-sm font-medium text-white hover:bg-card transition-colors"
        >
          Check
        </button>
      </div>
      {estimate && (
        <p className="text-muted text-sm">
          Estimated delivery by {estimate}
        </p>
      )}
    </div>
  );
}
