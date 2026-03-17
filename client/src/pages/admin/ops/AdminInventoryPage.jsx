import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../../api/client.js";

export function AdminInventoryPage() {
  const [data, setData] = useState({ items: [], lowStockCount: 0, outOfStockCount: 0 });
  const [stock, setStock] = useState({});

  const load = () => api.get("/admin/inventory").then(({ data }) => setData(data));
  useEffect(() => { load(); }, []);

  const setVariantStock = (productId, size, color, value) => {
    setStock({ ...stock, [`${productId}-${size}-${color}`]: value });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight text-white">Inventory Management</h1>
      <div className="text-sm text-muted">
        Low stock: <span className="text-white font-medium">{data.lowStockCount}</span> · Out of stock: <span className="text-white font-medium">{data.outOfStockCount}</span>
      </div>
      <div className="space-y-2">
        {data.items.map((p) => (
          <div key={p._id} className="bg-card rounded-xl border border-[#262626] p-4 text-sm space-y-3">
            <p className="font-medium text-white">{p.name}</p>
            {(p.variants || []).map((variant) => {
              const key = `${p._id}-${variant.size}-${variant.color}`;
              return (
                <div key={key} className="flex gap-2 items-center">
                  <p className="text-xs text-muted min-w-32">{variant.size} / {variant.color}</p>
                  <input
                    type="number"
                    className="rounded-lg border border-[#262626] bg-primary px-3 py-2 w-24 text-white"
                    value={stock[key] ?? variant.stock}
                    onChange={(e) => setVariantStock(p._id, variant.size, variant.color, e.target.value)}
                  />
                  <button
                    className="rounded-lg bg-accent text-primary px-3 py-2 text-sm font-medium"
                    onClick={() => api.patch(`/admin/inventory/${p._id}/stock`, { size: variant.size, color: variant.color, stock: Number(stock[key] ?? variant.stock) }).then(load)}
                  >
                    Update
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
