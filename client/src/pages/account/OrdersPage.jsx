import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/client.js";

const statusColors = {
  pending: "bg-[#52525b] text-white",
  confirmed: "bg-[#d4af37] text-white",
  packed: "bg-[#f59e0b] text-white",
  processing: "bg-[#d4af37] text-white",
  shipped: "bg-[#3b82f6] text-white",
  in_transit: "bg-[#6366f1] text-white",
  out_for_delivery: "bg-[#8b5cf6] text-white",
  delivered: "bg-[#22c55e] text-white",
  cancelled: "bg-[#ef4444] text-white",
};

const formatStatusLabel = (status) =>
  String(status || "pending")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/orders/me").then(({ data }) => setOrders(data));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Order History</h1>
        <p className="mt-1 text-sm text-[#a1a1aa]">Track and manage your orders</p>
      </div>

      <div className="space-y-4">
        {orders.map((o) => {
          const currentStatus = o.shipping?.status || o.status;
          const hasShippingData = Boolean(o.shipping?.status || o.shipping?.trackingId || o.shipping?.estimatedDelivery);

          return (
            <div
              key={o._id}
              className="block rounded-2xl border border-[#262626] bg-[#171717] p-6 shadow-xl transition-all duration-200 hover:border-[#d4af37]"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">
                      Order #{o._id.slice(-6).toUpperCase()}
                    </h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide ${statusColors[currentStatus] || statusColors.pending}`}
                    >
                      {formatStatusLabel(currentStatus)}
                    </span>
                  </div>
                  <p className="text-sm text-[#a1a1aa]">
                    {new Date(o.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <span className="text-white">
                      {o.items.length} {o.items.length === 1 ? "item" : "items"}
                    </span>
                    <span className="text-[#a1a1aa]">·</span>
                    <span className="font-medium text-white">₹{o.total.toFixed(2)}</span>
                    <span className="text-[#a1a1aa]">·</span>
                    <span className="text-[#a1a1aa]">
                      {o.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}
                    </span>
                  </div>

                  {hasShippingData ? (
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#a1a1aa]">
                      {o.shipping?.trackingId && <span>Tracking: {o.shipping.trackingId}</span>}
                      {o.shipping?.estimatedDelivery && (
                        <span>
                          ETA: {new Date(o.shipping.estimatedDelivery).toLocaleDateString("en-US")}
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-[#a1a1aa]">Processing order...</p>
                  )}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  {(o.paymentMethod === "online" && o.status === "pending" && ["pending", "failed"].includes(o.paymentStatus)) && (
                    <button
                      type="button"
                      onClick={() => navigate(`/checkout/resume/${o._id}`)}
                      className="rounded-xl border border-accent bg-accent/10 px-4 py-2 text-sm font-semibold text-accent"
                    >
                      Continue Payment
                    </button>
                  )}
                  <Link
                    to={`/account/orders/${o._id}`}
                    className="rounded-xl border border-[#262626] px-4 py-2 text-sm font-medium text-white"
                  >
                    View details
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
        {orders.length === 0 && (
          <div className="rounded-2xl border border-[#262626] bg-[#171717] p-12 text-center">
            <div className="mb-4 text-6xl">📦</div>
            <h3 className="mb-2 text-lg font-semibold text-white">No orders yet</h3>
            <p className="text-sm text-[#a1a1aa]">
              Start shopping to see your order history here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
