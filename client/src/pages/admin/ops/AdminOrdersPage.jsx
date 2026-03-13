import { useEffect, useState } from "react";
import api from "../../../api/client.js";

const statuses = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"];

export function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  const load = () => api.get("/admin/orders", { params: { q, status } }).then(({ data }) => setOrders(data));
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Order Management</h1>
      <div className="flex gap-2">
        <input className="border rounded px-3 py-2 text-sm" placeholder="Search order/customer" value={q} onChange={(e)=>setQ(e.target.value)} />
        <select className="border rounded px-3 py-2 text-sm" value={status} onChange={(e)=>setStatus(e.target.value)}><option value="">All statuses</option>{statuses.map(s=><option key={s} value={s}>{s}</option>)}</select>
        <button className="border rounded px-3 py-2 text-sm" onClick={load}>Apply</button>
      </div>
      <div className="space-y-2">
        {orders.map((o)=>(
          <div key={o._id} className="bg-white rounded-xl p-3 shadow-sm text-sm">
            <p className="font-medium">Order #{o._id.slice(-6).toUpperCase()} · {o.user?.name || "Guest"}</p>
            <p className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString()} · ${o.total.toFixed(2)} · {o.paymentMethod}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs">Status:</span>
              <select className="border rounded px-2 py-1 text-xs" value={o.status} onChange={(e)=>api.patch(`/admin/orders/${o._id}/status`,{status:e.target.value}).then(load)}>{statuses.map(s=><option key={s}>{s}</option>)}</select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
