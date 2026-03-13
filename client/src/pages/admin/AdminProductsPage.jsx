import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/client.js";

export function AdminProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({ q: "", stockStatus: "", visibility: "", newDrop: "" });
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v !== "")).toString();
    const { data } = await api.get(`/admin/products${params ? `?${params}` : ""}`);
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleVisibility = async (id) => {
    await api.patch(`/admin/products/${id}/visibility`);
    load();
  };

  const toggleNewDrop = async (id) => {
    await api.patch(`/admin/products/${id}/new-drop`);
    load();
  };

      <div className="bg-white rounded-xl p-3 shadow-sm grid sm:grid-cols-4 gap-2 text-sm">
        <input placeholder="Search products" className="border rounded-lg px-3 py-2" value={filters.q} onChange={(e)=>setFilters({...filters,q:e.target.value})} />
        <select className="border rounded-lg px-3 py-2" value={filters.stockStatus} onChange={(e)=>setFilters({...filters,stockStatus:e.target.value})}><option value="">Stock status</option><option value="low">Low</option><option value="out">Out</option></select>
        <select className="border rounded-lg px-3 py-2" value={filters.visibility} onChange={(e)=>setFilters({...filters,visibility:e.target.value})}><option value="">Visibility</option><option value="visible">Visible</option><option value="hidden">Hidden</option></select>
        <button className="rounded-lg bg-gray-900 text-white" onClick={load}>Apply Filters</button>
      </div>

  if (loading) {
    return <div className="text-sm text-gray-500">Loading products…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Admin products</h1>
        <Link
          to="/admin/products/new"
          className="rounded-full bg-gray-900 text-white px-4 py-2 text-xs font-semibold"
        >
          Add product
        </Link>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Visibility</th>
              <th className="px-4 py-3">New Drop</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-t">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3">${p.price.toFixed(2)}</td>
                <td className="px-4 py-3">{p.inventoryCount ?? 0}</td>
                <td className="px-4 py-3">{p.isVisible ? "Visible" : "Hidden"}</td>
                <td className="px-4 py-3">{p.isNewDrop ? "Yes" : "No"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/products/new?edit=${p._id}`)}
                      className="px-2 py-1 rounded-full border border-gray-300"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(p._id)}
                      className="px-2 py-1 rounded-full border border-red-200 text-red-600"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleVisibility(p._id)}
                      className="px-2 py-1 rounded-full border border-gray-300"
                    >
                      Toggle visibility
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleNewDrop(p._id)}
                      className="px-2 py-1 rounded-full border border-gray-300"
                    >
                      Toggle new drop
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="px-4 py-6 text-sm text-gray-500">No products found.</p>
        )}
      </div>
    </div>
  );
}
