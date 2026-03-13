import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
      // Optional: set error state / show toast
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []); // only on mount — filters are applied manually via button

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

  // Single product actions (you'll need matching backend endpoints)
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

  // ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-sm text-gray-500">Loading products…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Product Management</h1>
        <Link
          to="/admin/products/new"
          className="rounded-full bg-gray-900 text-white px-5 py-2.5 text-sm font-semibold hover:bg-gray-800 transition"
        >
          + Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border shadow-sm p-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input
            placeholder="Search by name..."
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          />

          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={filters.stockStatus}
            onChange={(e) => setFilters({ ...filters, stockStatus: e.target.value })}
          >
            <option value="">All stock levels</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>

          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={filters.visibility}
            onChange={(e) => setFilters({ ...filters, visibility: e.target.value })}
          >
            <option value="">All visibility</option>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </select>

          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={filters.newDrop}
            onChange={(e) => setFilters({ ...filters, newDrop: e.target.value })}
          >
            <option value="">All drops</option>
            <option value="true">New drop only</option>
          </select>

          <button
            onClick={loadProducts}
            className="bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-800 transition"
          >
            Apply Filters
          </button>
        </div>

        {/* Bulk actions (shown only when items selected) */}
        {selected.length > 0 && (
          <div className="mt-4 pt-4 border-t flex items-center gap-3 flex-wrap text-sm">
            <span className="text-gray-600">
              {selected.length} product{selected.length !== 1 ? "s" : ""} selected
            </span>
            <button
              onClick={() => handleBulkAction("hide")}
              className="px-3 py-1.5 border rounded text-gray-700 hover:bg-gray-50"
            >
              Hide
            </button>
            <button
              onClick={() => handleBulkAction("update_price")}
              className="px-3 py-1.5 border rounded text-gray-700 hover:bg-gray-50"
            >
              Set Price
            </button>
            <button
              onClick={() => handleBulkAction("delete")}
              className="px-3 py-1.5 border border-red-300 text-red-700 rounded hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-gray-50">
              <tr className="text-left border-b">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Visibility</th>
                <th className="px-5 py-3 font-medium">New Drop</th>
                <th className="px-5 py-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-500">
                    No products found matching your filters.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="border-t hover:bg-gray-50/50">
                    <td className="px-5 py-4 font-medium">{product.name}</td>
                    <td className="px-5 py-4">${(product.price || 0).toFixed(2)}</td>
                    <td className="px-5 py-4">
                      {product.inventoryCount ?? 0}
                      {product.inventoryCount <= 0 && (
                        <span className="ml-2 text-red-600 text-xs">Out</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={
                          product.isVisible
                            ? "text-green-600 font-medium"
                            : "text-gray-500"
                        }
                      >
                        {product.isVisible ? "Visible" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {product.isNewDrop ? (
                        <span className="text-blue-600 font-medium">Yes</span>
                      ) : (
                        "No"
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex flex-wrap gap-2 justify-center text-xs">
                        <button
                          onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                          className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => remove(product._id)}
                          className="px-3 py-1 rounded border border-red-200 text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => toggleVisibility(product._id)}
                          className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100"
                        >
                          {product.isVisible ? "Hide" : "Show"}
                        </button>
                        <button
                          onClick={() => toggleNewDrop(product._id)}
                          className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100"
                        >
                          {product.isNewDrop ? "Remove Drop" : "Mark New Drop"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}