import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/client.js";

export function AdminProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    q: "",
    stockStatus: "",
    visibility: "",
    newDrop: "",
  });
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(
        Object.entries(filters).filter(([, value]) => value !== "")
      ).toString();
      const url = `/admin/products${params ? `?${params}` : ""}`;
      const { data } = await api.get(url);
      setProducts(data || []);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (action) => {
    if (!selected.length) {
      alert("No products selected");
      return;
    }
    let value;
    if (action === "update_price") {
      value = window.prompt("Enter new price (number):");
      if (value === null || isNaN(Number(value)) || Number(value) < 0) {
        alert("Invalid price");
        return;
      }
      value = Number(value);
    }
    try {
      await api.post("/admin/products/bulk", { ids: selected, action, value });
      setSelected([]);
      loadProducts();
      alert("Bulk action completed");
    } catch (err) {
      console.error("Bulk action failed:", err);
      alert("Failed to perform bulk action");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this product permanently?")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      loadProducts();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Could not delete product");
    }
  };

  const toggleVisibility = async (id) => {
    try {
      await api.patch(`/admin/products/${id}/toggle-visibility`);
      loadProducts();
    } catch (err) {
      console.error("Toggle visibility failed:", err);
    }
  };

  const toggleNewDrop = async (id) => {
    try {
      await api.patch(`/admin/products/${id}/toggle-new-drop`);
      loadProducts();
    } catch (err) {
      console.error("Toggle new drop failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse rounded-xl bg-card border border-[#262626] h-32 w-full max-w-md" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">Product Management</h1>
        <Link
          to="/admin/products/new"
          className="rounded-xl bg-accent text-primary px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          + Add Product
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-[#262626] p-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input
            placeholder="Search by name..."
            className="rounded-lg border border-[#262626] bg-primary px-3 py-2 text-sm text-white placeholder-muted focus:outline-none focus:border-accent"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          />
          <select
            className="rounded-lg border border-[#262626] bg-primary px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
            value={filters.stockStatus}
            onChange={(e) => setFilters({ ...filters, stockStatus: e.target.value })}
          >
            <option value="">All stock levels</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
          <select
            className="rounded-lg border border-[#262626] bg-primary px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
            value={filters.visibility}
            onChange={(e) => setFilters({ ...filters, visibility: e.target.value })}
          >
            <option value="">All visibility</option>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </select>
          <select
            className="rounded-lg border border-[#262626] bg-primary px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
            value={filters.newDrop}
            onChange={(e) => setFilters({ ...filters, newDrop: e.target.value })}
          >
            <option value="">All drops</option>
            <option value="true">New drop only</option>
          </select>
          <button
            onClick={loadProducts}
            className="rounded-lg bg-accent text-primary px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Apply Filters
          </button>
        </div>
        {selected.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#262626] flex items-center gap-3 flex-wrap text-sm">
            <span className="text-muted">{selected.length} product{selected.length !== 1 ? "s" : ""} selected</span>
            <button onClick={() => handleBulkAction("hide")} className="rounded-lg border border-[#262626] px-3 py-1.5 text-white hover:bg-[#262626]">Hide</button>
            <button onClick={() => handleBulkAction("update_price")} className="rounded-lg border border-[#262626] px-3 py-1.5 text-white hover:bg-[#262626]">Set Price</button>
            <button onClick={() => handleBulkAction("delete")} className="rounded-lg border border-red-900/50 px-3 py-1.5 text-red-400 hover:bg-red-900/20">Delete</button>
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl border border-[#262626] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-[#262626]/50">
              <tr className="text-left border-b border-[#262626]">
                <th className="px-5 py-3 font-medium text-white">Name</th>
                <th className="px-5 py-3 font-medium text-white">Price</th>
                <th className="px-5 py-3 font-medium text-white">Stock</th>
                <th className="px-5 py-3 font-medium text-white">Visibility</th>
                <th className="px-5 py-3 font-medium text-white">New Drop</th>
                <th className="px-5 py-3 font-medium text-white text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted">
                    No products found matching your filters.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="border-t border-[#262626] hover:bg-[#262626]/30">
                    <td className="px-5 py-4 font-medium text-white">{product.name}</td>
                    <td className="px-5 py-4 text-muted">${(product.price || 0).toFixed(2)}</td>
                    <td className="px-5 py-4 text-muted">
                      {product.inventoryCount ?? 0}
                      {product.inventoryCount <= 0 && <span className="ml-2 text-red-400 text-xs">Out</span>}
                    </td>
                    <td className="px-5 py-4">
                      <span className={product.isVisible ? "text-emerald-400 font-medium" : "text-muted"}>
                        {product.isVisible ? "Visible" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted">{product.isNewDrop ? <span className="text-accent">Yes</span> : "No"}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2 justify-center text-xs">
                        <button onClick={() => navigate(`/admin/products/edit/${product._id}`)} className="rounded-lg border border-[#262626] px-3 py-1.5 text-white hover:bg-[#262626]">Edit</button>
                        <button onClick={() => remove(product._id)} className="rounded-lg border border-red-900/50 px-3 py-1.5 text-red-400 hover:bg-red-900/20">Delete</button>
                        <button onClick={() => toggleVisibility(product._id)} className="rounded-lg border border-[#262626] px-3 py-1.5 text-white hover:bg-[#262626]">{product.isVisible ? "Hide" : "Show"}</button>
                        <button onClick={() => toggleNewDrop(product._id)} className="rounded-lg border border-[#262626] px-3 py-1.5 text-white hover:bg-[#262626]">{product.isNewDrop ? "Remove Drop" : "Mark New Drop"}</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
