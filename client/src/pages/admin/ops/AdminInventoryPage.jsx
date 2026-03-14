import { useEffect, useState } from "react";
import api from "../../../api/client.js";

export function AdminInventoryPage() {
  const [data, setData] = useState({ items: [], lowStockCount: 0, outOfStockCount: 0 });
  const [stock, setStock] = useState({});

  const load = () => api.get("/admin/inventory").then(({ data }) => setData(data));
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Inventory Management</h1>
      <div className="text-sm">Low stock: {data.lowStockCount} · Out of stock: {data.outOfStockCount}</div>
      <div className="space-y-2">
        {data.items.map((p) => (
          <div key={p._id} className="bg-white rounded-xl p-3 shadow-sm text-sm flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-gray-500">Current: {p.inventoryCount} {p.inventoryCount === 0 ? "OUT OF STOCK" : p.inventoryCount < 5 ? "LOW STOCK" : ""}</p>
            </div>
            <div className="flex gap-2">
              <input type="number" className="border rounded px-2 py-1 w-24" value={stock[p._id] ?? p.inventoryCount} onChange={(e)=>setStock({...stock,[p._id]:e.target.value})} />
              <button className="border rounded px-2 py-1" onClick={()=>api.patch(`/admin/inventory/${p._id}/stock`,{inventoryCount:Number(stock[p._id] ?? p.inventoryCount)}).then(load)}>Update</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
