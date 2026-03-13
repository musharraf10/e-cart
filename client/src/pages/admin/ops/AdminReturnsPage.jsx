import { useEffect, useState } from "react";
import api from "../../../api/client.js";

const statuses = ["requested", "approved", "rejected", "completed"];

export function AdminReturnsPage() {
  const [items, setItems] = useState([]);
  const load = () => api.get('/admin/returns').then(({data})=>setItems(data));
  useEffect(()=>{load();},[]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Disputes & Returns</h1>
      {items.map((r)=>(
        <div key={r._id} className="bg-white rounded-xl p-3 shadow-sm text-sm flex items-center justify-between">
          <div>
            <p className="font-medium">{r.type} · Order #{r.order?._id?.toString().slice(-6).toUpperCase()}</p>
            <p className="text-xs text-gray-500">{r.user?.name} · {r.reason || 'No reason'}</p>
          </div>
          <select className="border rounded px-2 py-1 text-xs" value={r.status} onChange={(e)=>api.patch(`/admin/returns/${r._id}/status`,{status:e.target.value}).then(load)}>{statuses.map(s=><option key={s}>{s}</option>)}</select>
        </div>
      ))}
    </div>
  );
}
