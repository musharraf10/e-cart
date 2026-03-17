import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../../api/client.js";

export function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const load = () => api.get("/admin/customers").then(({ data }) => setCustomers(data));
  useEffect(() => { load(); }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight text-white">Customer Management</h1>
      {customers.length === 0 ? (
        <div className="rounded-xl bg-card border border-[#262626] py-12 text-center text-muted">No customers yet.</div>
      ) : (
        customers.map((c) => (
          <div
            key={c._id}
            className="bg-card rounded-xl border border-[#262626] p-4 text-sm flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
          >
            <div>
              <p className="font-medium text-white">{c.name}</p>
              <p className="text-xs text-muted mt-0.5">{c.email} · {c.mobileNumber || "No phone"}</p>
              <p className="text-xs text-muted">Orders: {c.totalOrders} · Spent: ${(c.totalSpent || 0).toFixed(2)}</p>
            </div>
            <div className="flex gap-2 text-xs">
              <button className="rounded-lg border border-[#262626] px-3 py-1.5 text-white hover:bg-[#262626]" onClick={() => api.patch(`/admin/customers/${c._id}/block`).then(load)}>
                {c.isBlocked ? "Unblock" : "Block"}
              </button>
              <button className="rounded-lg border border-red-900/50 px-3 py-1.5 text-red-400 hover:bg-red-900/20" onClick={() => api.delete(`/admin/customers/${c._id}`).then(load)}>Delete</button>
            </div>
          </div>
        ))
      )}
    </motion.div>
  );
}
