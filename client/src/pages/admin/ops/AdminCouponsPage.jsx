import { useEffect, useState } from "react";
import api from "../../../api/client.js";

export function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({ code: "", discountType: "percentage", discountValue: 10, minOrderValue: 0, validFrom: "", validTo: "" });
  const load = () => api.get("/admin/coupons").then(({ data }) => setCoupons(data));
  useEffect(()=>{load();},[]);

  const create = async (e) => {
    e.preventDefault();
    await api.post("/admin/coupons", form);
    setForm({ code: "", discountType: "percentage", discountValue: 10, minOrderValue: 0, validFrom: "", validTo: "" });
    load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Coupons & Promotions</h1>
      <form onSubmit={create} className="bg-white rounded-xl p-3 shadow-sm grid sm:grid-cols-3 gap-2 text-sm">
        <input className="border rounded px-2 py-1" placeholder="Code" value={form.code} onChange={(e)=>setForm({...form,code:e.target.value.toUpperCase()})} required />
        <select className="border rounded px-2 py-1" value={form.discountType} onChange={(e)=>setForm({...form,discountType:e.target.value})}><option value="percentage">Percentage</option><option value="fixed">Fixed</option></select>
        <input className="border rounded px-2 py-1" type="number" placeholder="Discount value" value={form.discountValue} onChange={(e)=>setForm({...form,discountValue:Number(e.target.value)})} />
        <input className="border rounded px-2 py-1" type="number" placeholder="Min order" value={form.minOrderValue} onChange={(e)=>setForm({...form,minOrderValue:Number(e.target.value)})} />
        <input className="border rounded px-2 py-1" type="date" value={form.validFrom} onChange={(e)=>setForm({...form,validFrom:e.target.value})} required />
        <input className="border rounded px-2 py-1" type="date" value={form.validTo} onChange={(e)=>setForm({...form,validTo:e.target.value})} required />
        <button className="sm:col-span-3 rounded bg-gray-900 text-white py-2">Create coupon</button>
      </form>
      <div className="space-y-2">{coupons.map((c)=><div key={c._id} className="bg-white rounded-xl p-3 shadow-sm text-sm">{c.code} · {c.discountType} {c.discountValue} · Expires {new Date(c.validTo).toLocaleDateString()}</div>)}</div>
    </div>
  );
}
