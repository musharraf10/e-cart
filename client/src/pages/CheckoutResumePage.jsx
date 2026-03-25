import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client.js";

function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function CheckoutResumePage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;

    api.get(`/orders/${orderId}`)
      .then(({ data }) => {
        setOrder(data);
        if (data.paymentStatus === "paid") {
          navigate(`/order-status/${orderId}`);
        }
      })
      .catch((err) => setError(err.response?.data?.message || "Order not found"))
      .finally(() => setLoading(false));
  }, [navigate, orderId]);

  const handleContinue = async () => {
    try {
      setError("");
      setMessage("Preparing Razorpay checkout...");

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error("Unable to load Razorpay SDK.");
      }

      const { data: paymentData } = await api.post("/payments/create-razorpay-order", { orderId });
      if (paymentData.alreadyPaid) {
        navigate(`/order-status/${orderId}`);
        return;
      }

      setMessage("Opening payment window...");
      const response = await new Promise((resolve, reject) => {
        const razorpay = new window.Razorpay({
          key: paymentData.key,
          amount: paymentData.amount,
          currency: paymentData.currency,
          name: "NoorFit",
          description: "Order Payment Retry",
          order_id: paymentData.orderId,
          handler: resolve,
          modal: {
            ondismiss: () => reject(new Error("Payment popup closed.")),
          },
        });

        razorpay.on("payment.failed", () => reject(new Error("Payment failed.")));
        razorpay.open();
      });

      setMessage("Verifying payment...");
      const { data } = await api.post("/payments/verify", { ...response, orderId });
      if (!data.verified) {
        throw new Error("Verification failed. Please retry.");
      }

      navigate(`/order-status/${orderId}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to resume payment.");
      setMessage("");
    }
  };

  if (loading) {
    return <p className="text-sm text-muted">Loading pending order...</p>;
  }

  return (
    <div className="mx-auto max-w-lg space-y-5 rounded-2xl border border-border bg-card p-6">
      <h1 className="text-2xl font-semibold text-white">Continue Payment</h1>
      {order && (
        <div className="rounded-xl border border-border bg-primary/60 p-4 text-sm text-muted">
          <p>Order #{order._id.slice(-6).toUpperCase()}</p>
          <p className="mt-1 text-white">Total: ₹{order.total.toFixed(2)}</p>
          <p className="mt-1 capitalize">Payment status: {order.paymentStatus}</p>
        </div>
      )}

      {message && <p className="text-sm text-accent">{message}</p>}
      {error && <p className="text-sm text-red-300">{error}</p>}

      <button
        type="button"
        onClick={handleContinue}
        className="w-full rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-primary"
      >
        Continue Payment
      </button>
    </div>
  );
}
