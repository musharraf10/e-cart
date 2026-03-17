import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../../api/client.js";

export function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({ code: "", discountType: "percentage", discountValue: 10, minOrderValue: 0, validFrom: "", validTo: "" });
  const load = () => api.get("/admin/coupons").then(({ data }) => setCoupons(data));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post("/admin/coupons", form);
    setForm({ code: "", discountType: "percentage", discountValue: 10, minOrderValue: 0, validFrom: "", validTo: "" });
    load();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight text-white">Coupons & Promotions</h1>
      <form onSubmit={create} className="bg-card rounded-xl border border-[#262626] p-4 grid sm:grid-cols-3 gap-3 text-sm">
        <input className="rounded-lg border border-[#262626] bg-primary px-3 py-2 text-white placeholder-muted focus:outline-none focus:border-accent" placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
        <select className="rounded-lg border border-[#262626] bg-primary px-3 py-2 text-white focus:outline-none focus:border-accent" value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed</option>
        </select>
        <input className="rounded-lg border border-[#262626] bg-primary px-3 py-2 text-white focus:outline-none focus:border-accent" type="number" placeholder="Discount value" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} />
        <input className="rounded-lg border border-[#262626] bg-primary px-3 py-2 text-white focus:outline-none focus:border-accent" type="number" placeholder="Min order" value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: Number(e.target.value) })} />
        <input className="rounded-lg border border-[#262626] bg-primary px-3 py-2 text-white focus:outline-none focus:border-accent" type="date" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} required />
        <input className="rounded-lg border border-[#262626] bg-primary px-3 py-2 text-white focus:outline-none focus:border-accent" type="date" value={form.validTo} onChange={(e) => setForm({ ...form, validTo: e.target.value })} required />
        <button className="sm:col-span-3 rounded-xl bg-accent text-primary py-2.5 font-medium hover:opacity-90">Create coupon</button>
      </form>
      <div className="space-y-2">
        {coupons.length === 0 ? (
          <div className="rounded-xl bg-card border border-[#262626] py-12 text-center text-muted">No coupons yet.</div>
        ) : (
          coupons.map((c) => (
            <div key={c._id} className="bg-card rounded-xl border border-[#262626] p-4 text-sm text-white">
              {c.code} · {c.discountType} {c.discountValue} · Expires {new Date(c.validTo).toLocaleDateString()}
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
