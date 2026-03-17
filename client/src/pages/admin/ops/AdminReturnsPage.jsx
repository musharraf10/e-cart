import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../../api/client.js";

const statuses = ["requested", "approved", "rejected", "completed"];

export function AdminReturnsPage() {
  const [items, setItems] = useState([]);
  const load = () => api.get("/admin/returns").then(({ data }) => setItems(data));
  useEffect(() => { load(); }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight text-white">Disputes & Returns</h1>
      {items.length === 0 ? (
        <div className="rounded-xl bg-card border border-[#262626] py-12 text-center text-muted">No returns or disputes.</div>
      ) : (
        items.map((r) => (
          <div
            key={r._id}
            className="bg-card rounded-xl border border-[#262626] p-4 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div>
              <p className="font-medium text-white">{r.type} · Order #{r.order?._id?.toString().slice(-6).toUpperCase()}</p>
              <p className="text-xs text-muted mt-0.5">{r.user?.name} · {r.reason || "No reason"}</p>
            </div>
            <select
              className="rounded-lg border border-[#262626] bg-primary px-2 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
              value={r.status}
              onChange={(e) => api.patch(`/admin/returns/${r._id}/status`, { status: e.target.value }).then(load)}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        ))
      )}
    </motion.div>
  );
}
