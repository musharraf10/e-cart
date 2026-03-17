import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../../api/client.js";

export function AdminInventoryPage() {
  const [data, setData] = useState({ items: [], lowStockCount: 0, outOfStockCount: 0 });
  const [stock, setStock] = useState({});

  const load = () => api.get("/admin/inventory").then(({ data }) => setData(data));
  useEffect(() => { load(); }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight text-white">Inventory Management</h1>
      <div className="text-sm text-muted">
        Low stock: <span className="text-white font-medium">{data.lowStockCount}</span> · Out of stock: <span className="text-white font-medium">{data.outOfStockCount}</span>
      </div>
      <div className="space-y-2">
        {data.items.length === 0 ? (
          <div className="rounded-xl bg-card border border-[#262626] py-12 text-center text-muted">
            No inventory items.
          </div>
        ) : (
          data.items.map((p) => (
            <div
              key={p._id}
              className="bg-card rounded-xl border border-[#262626] p-4 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <p className="font-medium text-white">{p.name}</p>
                <p className="text-xs text-muted mt-0.5">
                  Current: {p.inventoryCount}{" "}
                  {p.inventoryCount === 0 ? "OUT OF STOCK" : p.inventoryCount < 5 ? "LOW STOCK" : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  className="rounded-lg border border-[#262626] bg-primary px-3 py-2 w-24 text-white focus:outline-none focus:border-accent"
                  value={stock[p._id] ?? p.inventoryCount}
                  onChange={(e) => setStock({ ...stock, [p._id]: e.target.value })}
                />
                <button
                  className="rounded-lg bg-accent text-primary px-3 py-2 text-sm font-medium hover:opacity-90"
                  onClick={() =>
                    api.patch(`/admin/inventory/${p._id}/stock`, {
                      inventoryCount: Number(stock[p._id] ?? p.inventoryCount),
                    }).then(load)
                  }
                >
                  Update
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
