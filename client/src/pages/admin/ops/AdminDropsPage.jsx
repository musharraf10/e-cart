import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../../api/client.js";

export function AdminDropsPage() {
  const [drops, setDrops] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ product: "", launchAt: "" });

  const load = async () => {
    const [dropsRes, productsRes] = await Promise.all([api.get("/admin/drops"), api.get("/admin/products")]);
    setDrops(dropsRes.data);
    setProducts(productsRes.data || []);
  };
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post("/admin/drops", form);
    setForm({ product: "", launchAt: "" });
    load();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight text-white">New Drops Scheduling</h1>
      <form onSubmit={create} className="bg-card rounded-xl border border-[#262626] p-4 grid sm:grid-cols-3 gap-3 text-sm">
        <select className="rounded-lg border border-[#262626] bg-primary px-3 py-2 text-white focus:outline-none focus:border-accent" value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} required>
          <option value="">Select product</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>
        <input className="rounded-lg border border-[#262626] bg-primary px-3 py-2 text-white focus:outline-none focus:border-accent" type="datetime-local" value={form.launchAt} onChange={(e) => setForm({ ...form, launchAt: e.target.value })} required />
        <button className="rounded-xl bg-accent text-primary py-2.5 font-medium hover:opacity-90">Schedule drop</button>
      </form>
      <div className="space-y-2">
        {drops.length === 0 ? (
          <div className="rounded-xl bg-card border border-[#262626] py-12 text-center text-muted">No scheduled drops.</div>
        ) : (
          drops.map((d) => (
            <div key={d._id} className="bg-card rounded-xl border border-[#262626] p-4 text-sm flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div className="text-white">{d.product?.name} · {new Date(d.launchAt).toLocaleString()} · {d.isActivated ? "Activated" : "Upcoming"}</div>
              {!d.isActivated && (
                <button className="rounded-lg border border-[#262626] px-3 py-1.5 text-xs text-white hover:bg-[#262626]" onClick={() => api.patch(`/admin/drops/${d._id}/activate`).then(load)}>Activate</button>
              )}
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
