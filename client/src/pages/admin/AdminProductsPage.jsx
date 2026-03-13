import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/client.js";

export function AdminProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({ q: "", stockStatus: "", visibility: "", newDrop: "" });
  const [selected, setSelected] = useState([]);

  const load = async () => {
    const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v !== "")).toString();
    const { data } = await api.get(`/admin/products${params ? `?${params}` : ""}`);
    setProducts(data);
  };

  useEffect(() => { load(); }, []);

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const bulkAction = async (action) => {
    if (!selected.length) return;
    const value = action === "update_price" ? window.prompt("Enter new price") : undefined;
    await api.post("/admin/products/bulk", { ids: selected, action, value });
    setSelected([]);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h1 className="text-xl font-semibold">Product Management</h1>
        <Link to="/admin/products/new" className="rounded-full bg-gray-900 text-white px-4 py-2 text-xs font-semibold">Add product</Link>
      </div>

      <div className="bg-white rounded-xl p-3 shadow-sm grid sm:grid-cols-4 gap-2 text-sm">
        <input placeholder="Search products" className="border rounded-lg px-3 py-2" value={filters.q} onChange={(e)=>setFilters({...filters,q:e.target.value})} />
        <select className="border rounded-lg px-3 py-2" value={filters.stockStatus} onChange={(e)=>setFilters({...filters,stockStatus:e.target.value})}><option value="">Stock status</option><option value="low">Low</option><option value="out">Out</option></select>
        <select className="border rounded-lg px-3 py-2" value={filters.visibility} onChange={(e)=>setFilters({...filters,visibility:e.target.value})}><option value="">Visibility</option><option value="visible">Visible</option><option value="hidden">Hidden</option></select>
        <button className="rounded-lg bg-gray-900 text-white" onClick={load}>Apply Filters</button>
      </div>

      <div className="flex gap-2 text-xs">
        <button className="border rounded-full px-3 py-1" onClick={() => bulkAction("hide")}>Hide selected</button>
        <button className="border rounded-full px-3 py-1" onClick={() => bulkAction("delete")}>Delete selected</button>
        <button className="border rounded-full px-3 py-1" onClick={() => bulkAction("update_price")}>Update prices</button>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr><th className="px-2"/><th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Price</th><th className="px-4 py-3 text-left">Stock</th><th className="px-4 py-3 text-left">Visibility</th><th className="px-4 py-3 text-left">New Drop</th><th className="px-4 py-3 text-left">Featured</th><th className="px-4 py-3 text-left">Actions</th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-t">
                <td className="px-2"><input type="checkbox" checked={selected.includes(p._id)} onChange={()=>toggleSelect(p._id)} /></td>
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">${p.price.toFixed(2)}</td>
                <td className="px-4 py-3">{p.inventoryCount}</td>
                <td className="px-4 py-3">{p.isVisible ? "Visible" : "Hidden"}</td>
                <td className="px-4 py-3">{p.isNewDrop ? "Yes" : "No"}</td>
                <td className="px-4 py-3">{p.isFeatured ? "Yes" : "No"}</td>
                <td className="px-4 py-3"><div className="flex gap-2 text-xs flex-wrap">
                  <button className="border rounded-full px-2 py-1" onClick={()=>navigate(`/admin/products/new?edit=${p._id}`)}>Edit</button>
                  <button className="border rounded-full px-2 py-1" onClick={()=>api.delete(`/admin/products/${p._id}`).then(load)}>Delete</button>
                  <button className="border rounded-full px-2 py-1" onClick={()=>api.patch(`/admin/products/${p._id}/visibility`).then(load)}>Hide/Show</button>
                  <button className="border rounded-full px-2 py-1" onClick={()=>api.patch(`/admin/products/${p._id}/new-drop`).then(load)}>New Drop</button>
                  <button className="border rounded-full px-2 py-1" onClick={()=>api.patch(`/admin/products/${p._id}/featured`).then(load)}>Featured</button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
