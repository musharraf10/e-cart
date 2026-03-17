import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../../api/client.js";

const statuses = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"];

export function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  const load = () => api.get("/admin/orders", { params: { q, status } }).then(({ data }) => setOrders(data));
  useEffect(() => { load(); }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight text-white">Order Management</h1>
      <div className="flex flex-wrap gap-2">
        <input
          className="rounded-xl border border-[#262626] bg-primary px-3 py-2 text-sm text-white placeholder-muted focus:outline-none focus:border-accent"
          placeholder="Search order/customer"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="rounded-xl border border-[#262626] bg-primary px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          className="rounded-xl bg-accent text-primary px-4 py-2 text-sm font-medium hover:opacity-90"
          onClick={load}
        >
          Apply
        </button>
      </div>
      <div className="space-y-2">
        {orders.length === 0 ? (
          <div className="rounded-xl bg-card border border-[#262626] py-12 text-center text-muted">
            No orders found.
          </div>
        ) : (
          orders.map((o) => (
            <div
              key={o._id}
              className="bg-card rounded-xl border border-[#262626] p-4 text-sm hover:border-[#262626]/80 transition-colors"
            >
              <p className="font-medium text-white">Order #{o._id.slice(-6).toUpperCase()} · {o.user?.name || "Guest"}</p>
              <p className="text-xs text-muted mt-0.5">{new Date(o.createdAt).toLocaleString()} · ${o.total.toFixed(2)} · {o.paymentMethod}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-muted">Status:</span>
                <select
                  className="rounded-lg border border-[#262626] bg-primary px-2 py-1 text-xs text-white focus:outline-none focus:border-accent"
                  value={o.status}
                  onChange={(e) => api.patch(`/admin/orders/${o._id}/status`, { status: e.target.value }).then(load)}
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
