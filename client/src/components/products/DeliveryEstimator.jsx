import { useEffect, useMemo, useState } from "react";
import useUserPincode from "../../api/useUserPincode.js";

export function DeliveryEstimator() {
  const { pincode: detectedPincode, source } = useUserPincode();
  const [pin, setPin] = useState("");
  const [estimate, setEstimate] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!pin && detectedPincode) {
      setPin(String(detectedPincode));
    }
  }, [detectedPincode, pin]);

  const normalizedPin = useMemo(() => pin.replace(/\D/g, "").slice(0, 6), [pin]);

  useEffect(() => {
    if (!normalizedPin) {
      setEstimate(null);
      setError("");
      return;
    }

    if (normalizedPin.length < 6) {
      setEstimate(null);
      setError("Please enter a valid 6-digit pincode.");
      return;
    }

    setError("");
    const checksum =
      normalizedPin
        .split("")
        .map(Number)
        .reduce((sum, digit) => sum + digit, 0) % 4;
    const dispatchDays = 1 + checksum;
    const date = new Date();
    date.setDate(date.getDate() + dispatchDays);
    setEstimate({
      date: date.toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      dispatchDays,
    });
  }, [normalizedPin]);

  return (
    <div className="rounded-xl bg-card border border-[#262626] p-6 space-y-3">
      <h3 className="font-semibold text-white">Delivery Information</h3>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-xl border border-[#262626] bg-primary px-4 py-2.5 text-white text-sm placeholder-muted focus:outline-none focus:border-accent"
          placeholder="Enter pincode"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          inputMode="numeric"
          maxLength={6}
        />
      </div>
      {detectedPincode && !pin && (
        <button
          onClick={() => setPin(detectedPincode)}
          className="text-xs text-accent underline"
        >
          Use detected pincode ({detectedPincode}) via {source}
        </button>
      )}
      {error && <p className="text-sm text-red-300">{error}</p>}
      {estimate && !error && (
        <p className="text-muted text-sm">
          Estimated delivery by <span className="text-white font-medium">{estimate.date}</span> (
          {estimate.dispatchDays} business day{estimate.dispatchDays > 1 ? "s" : ""})
        </p>
      )}
    </div>
  );
}
