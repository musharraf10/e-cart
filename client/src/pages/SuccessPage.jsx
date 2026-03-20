import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/client.js";
import { useToast } from "../components/ui/ToastProvider.jsx";

function getMessage(paymentStatus) {
  if (paymentStatus === "paid") {
    return {
      title: "Payment successful",
      description: "Your order has been confirmed and payment has been received.",
    };
  }

  if (paymentStatus === "failed") {
    return {
      title: "Payment failed",
      description: "We could not confirm your payment. You can retry from your account orders page.",
    };
  }

  return {
    title: "Processing payment",
    description: "We received your order and are waiting for Stripe webhook confirmation.",
  };
}

export function SuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { notify } = useToast();

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    let active = true;
    let attempts = 0;
    let timeoutId;

    const loadOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${orderId}`);
        if (!active) return;
        setOrder(data);
        if (data.paymentStatus === "pending" && attempts < 5) {
          attempts += 1;
          timeoutId = window.setTimeout(loadOrder, 2000);
          return;
        }
        setLoading(false);
      } catch (error) {
        if (!active) return;
        notify(error.response?.data?.message || "Unable to load the order.", "error");
        setLoading(false);
      }
    };

    loadOrder();

    return () => {
      active = false;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [orderId, notify]);

  const message = getMessage(order?.paymentStatus);

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 text-center shadow-card">
      <p className="text-sm uppercase tracking-[0.25em] text-accent">Order update</p>
      <h1 className="mt-3 text-3xl font-semibold text-white">{message.title}</h1>
      <p className="mt-4 text-sm text-muted">{message.description}</p>

      {loading && <p className="mt-6 text-sm text-muted">Checking your latest payment status...</p>}

      {order && (
        <div className="mt-8 rounded-xl border border-border bg-primary p-5 text-left">
          <p className="text-sm text-muted">Order ID</p>
          <p className="mt-1 font-medium text-white">{order._id}</p>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted">Order status</p>
              <p className="font-medium capitalize text-white">{order.status}</p>
            </div>
            <div>
              <p className="text-muted">Payment status</p>
              <p className="font-medium capitalize text-white">{order.paymentStatus}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link to="/account/orders" className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-primary">
          View orders
        </Link>
        <Link to={orderId ? `/cancel?orderId=${orderId}` : "/cancel"} className="rounded-xl border border-border px-5 py-3 text-sm font-semibold text-white">
          Need to retry?
        </Link>
      </div>
    </div>
  );
}
