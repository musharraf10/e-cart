import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/client.js";
import { useToast } from "../components/ui/ToastProvider.jsx";

function getStatusMessage(orderStatus, paymentStatus) {
  if (orderStatus === "confirmed" || paymentStatus === "paid") {
    return {
      title: "Order placed successfully",
      description: "Stripe verified your payment and your order is now confirmed.",
    };
  }

  if (orderStatus === "cancelled" || paymentStatus === "failed") {
    return {
      title: "Payment failed",
      description: "Stripe reported a failed payment, so this order was cancelled.",
    };
  }

  return {
    title: "Verifying payment...",
    description: "Payment was submitted successfully. We are waiting for Stripe webhook confirmation.",
  };
}

export function OrderStatusPage() {
  const { paymentIntentId } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [orderState, setOrderState] = useState(null);
  const [loading, setLoading] = useState(true);

  const statusMessage = useMemo(
    () => getStatusMessage(orderState?.orderStatus, orderState?.paymentStatus),
    [orderState?.orderStatus, orderState?.paymentStatus],
  );

  useEffect(() => {
    if (!paymentIntentId) {
      setLoading(false);
      return undefined;
    }

    let isMounted = true;
    let timeoutId;

    const loadStatus = async () => {
      try {
        const { data } = await api.get(`/orders/status/${paymentIntentId}`);
        if (!isMounted) return;

        setOrderState(data);
        setLoading(false);

        if (!data.isFinal) {
          timeoutId = window.setTimeout(loadStatus, 2500);
        }
      } catch (error) {
        if (!isMounted) return;
        setLoading(false);
        notify(error.response?.data?.message || "Unable to verify order status.", "error");
      }
    };

    loadStatus();

    return () => {
      isMounted = false;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [notify, paymentIntentId]);

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 text-center shadow-card">
      <p className="text-sm uppercase tracking-[0.25em] text-accent">Order status</p>
      <h1 className="mt-3 text-3xl font-semibold text-white">{statusMessage.title}</h1>
      <p className="mt-4 text-sm text-muted">{statusMessage.description}</p>

      {loading && <p className="mt-6 text-sm text-muted">Checking payment status...</p>}

      {orderState?.order && (
        <div className="mt-8 rounded-xl border border-border bg-primary p-5 text-left">
          <p className="text-sm text-muted">Payment intent</p>
          <p className="mt-1 break-all font-medium text-white">{paymentIntentId}</p>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted">Order status</p>
              <p className="font-medium capitalize text-white">{orderState.orderStatus}</p>
            </div>
            <div>
              <p className="text-muted">Payment status</p>
              <p className="font-medium capitalize text-white">{orderState.paymentStatus}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {orderState?.orderId && (
          <button
            type="button"
            onClick={() => navigate(`/account/orders/${orderState.orderId}`)}
            className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-primary"
          >
            View order
          </button>
        )}
        <Link to="/account/orders" className="rounded-xl border border-border px-5 py-3 text-sm font-semibold text-white">
          All orders
        </Link>
      </div>
    </div>
  );
}
