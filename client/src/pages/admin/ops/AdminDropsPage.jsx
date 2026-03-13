import { useEffect, useState } from "react";
import api from "../../../api/client.js";

export function AdminDropsPage() {
  const [drops, setDrops] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ product: "", launchAt: "" });

  const load = async () => {
    const [dropsRes, productsRes] = await Promise.all([api.get('/admin/drops'), api.get('/admin/products')]);
    setDrops(dropsRes.data);
    setProducts(productsRes.data);
  };
  useEffect(()=>{load();},[]);

  const create = async (e) => { e.preventDefault(); await api.post('/admin/drops', form); setForm({product:"",launchAt:""}); load(); };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">New Drops Scheduling</h1>
      <form onSubmit={create} className="bg-white rounded-xl p-3 shadow-sm grid sm:grid-cols-3 gap-2 text-sm">
        <select className="border rounded px-2 py-1" value={form.product} onChange={(e)=>setForm({...form,product:e.target.value})} required><option value="">Select product</option>{products.map((p)=><option key={p._id} value={p._id}>{p.name}</option>)}</select>
        <input className="border rounded px-2 py-1" type="datetime-local" value={form.launchAt} onChange={(e)=>setForm({...form,launchAt:e.target.value})} required />
        <button className="rounded bg-gray-900 text-white">Schedule drop</button>
      </form>
      <div className="space-y-2">{drops.map((d)=><div key={d._id} className="bg-white rounded-xl p-3 shadow-sm text-sm flex justify-between"><div>{d.product?.name} · {new Date(d.launchAt).toLocaleString()} · {d.isActivated ? 'Activated' : 'Upcoming'}</div><button className="border rounded px-2 py-1 text-xs" onClick={()=>api.patch(`/admin/drops/${d._id}/activate`).then(load)}>Activate</button></div>)}</div>
    </div>
  );
}
