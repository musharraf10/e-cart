import { useEffect, useState } from "react";
import api from "../../../api/client.js";

export function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const load = () => api.get("/admin/customers").then(({ data }) => setCustomers(data));
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Customer Management</h1>
      {customers.map((c) => (
        <div key={c._id} className="bg-white rounded-xl p-3 shadow-sm text-sm flex justify-between items-center">
          <div>
            <p className="font-medium">{c.name}</p>
            <p className="text-xs text-gray-500">{c.email} · {c.mobileNumber || "No phone"}</p>
            <p className="text-xs">Orders: {c.totalOrders} · Spent: ${c.totalSpent.toFixed(2)}</p>
          </div>
          <div className="flex gap-2 text-xs">
            <button className="border rounded-full px-2 py-1" onClick={()=>api.patch(`/admin/customers/${c._id}/block`).then(load)}>{c.isBlocked ? "Unblock" : "Block"}</button>
            <button className="border rounded-full px-2 py-1" onClick={()=>api.delete(`/admin/customers/${c._id}`).then(load)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
