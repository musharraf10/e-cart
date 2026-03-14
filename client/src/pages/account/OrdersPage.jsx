import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client.js";

const statusColors = {
  pending: "bg-[#52525b] text-white",
  processing: "bg-[#d4af37] text-white",
  shipped: "bg-[#3b82f6] text-white",
  delivered: "bg-[#22c55e] text-white",
  cancelled: "bg-[#ef4444] text-white",
};

export function OrdersPage() {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    api.get("/orders/me").then(({ data }) => setOrders(data));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Order History</h1>
        <p className="text-[#a1a1aa] text-sm mt-1">Track and manage your orders</p>
      </div>

      <div className="space-y-4">
        {orders.map((o) => (
          <Link
            key={o._id}
            to={`/account/orders/${o._id}`}
            className="block bg-[#171717] border border-[#262626] rounded-2xl p-6 shadow-xl hover:border-[#d4af37] transition-all duration-200 group"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-white font-semibold text-lg">
                    Order #{o._id.slice(-6).toUpperCase()}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${statusColors[o.status] || statusColors.pending
                      }`}
                  >
                    {o.status}
                  </span>
                </div>
                <p className="text-[#a1a1aa] text-sm">
                  {new Date(o.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="text-white">
                    {o.items.length} {o.items.length === 1 ? "item" : "items"}
                  </span>
                  <span className="text-[#a1a1aa]">·</span>
                  <span className="text-white font-medium">${o.total.toFixed(2)}</span>
                  <span className="text-[#a1a1aa]">·</span>
                  <span className="text-[#a1a1aa]">
                    {o.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#d4af37] text-sm font-medium group-hover:translate-x-1 transition-transform">
                  View Details →
                </span>
              </div>
            </div>
          </Link>
        ))}
        {orders.length === 0 && (
          <div className="bg-[#171717] border border-[#262626] rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-white text-lg font-semibold mb-2">No orders yet</h3>
            <p className="text-[#a1a1aa] text-sm">
              Start shopping to see your order history here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
