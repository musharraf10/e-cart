import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/client.js";

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

const inputClass =
  "w-full rounded-xl border border-[#262626] bg-[#111] px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/10 transition-all duration-200";

function StockBadge({ stock }) {
  if (stock <= 0)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 border border-red-500/25 px-2 py-0.5 text-[11px] font-semibold text-red-400">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
        Out of stock
      </span>
    );
  if (stock <= 5)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 text-[11px] font-semibold text-amber-400">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        Low · {stock}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      {stock} in stock
    </span>
  );
}

function ProductImage({ product }) {
  const src =
    product.images?.[0] ||
    product.image ||
    null;

  if (src)
    return (
      <img
        src={src}
        alt={product.name}
        className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-[#2a2a2a]"
      />
    );

  const initials = product.name
    ?.split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-emerald-800/30 border border-accent/20 flex items-center justify-center text-[11px] font-bold text-accent flex-shrink-0">
      {initials}
    </div>
  );
}

export function AdminProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({ q: "", stockStatus: "", visibility: "", newDrop: "" });
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(
        Object.entries(filters).filter(([, v]) => v !== "")
      ).toString();
      const { data } = await api.get(`/admin/products${params ? `?${params}` : ""}`);
      setProducts(data || []);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const totalStock = products.reduce(
    (s, p) => s + (p.variants || []).reduce((vs, v) => vs + (v.stock || 0), 0),
    0
  );
  const hiddenCount = products.filter((p) => !p.isVisible).length;
  const newDropCount = products.filter((p) => p.isNewDrop).length;

  const toggleSelect = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  const selectAll = () =>
    setSelected(selected.length === products.length ? [] : products.map((p) => p._id));

  const handleBulkAction = async (action) => {
    if (!selected.length) return;
    let value;
    if (action === "update_price") {
      value = window.prompt("Enter new price:");
      if (value === null || isNaN(Number(value)) || Number(value) < 0) return;
      value = Number(value);
    }
    if (action === "delete" && !window.confirm(`Delete ${selected.length} product(s)?`)) return;
    setBulkLoading(true);
    try {
      await api.post("/admin/products/bulk", { ids: selected, action, value });
      setSelected([]);
      loadProducts();
    } catch (err) {
      console.error("Bulk action failed:", err);
    } finally {
      setBulkLoading(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this product permanently?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/admin/products/${id}`);
      loadProducts();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const toggleVisibility = async (id) => {
    setTogglingId(id);
    try {
      await api.patch(`/admin/products/${id}/visibility`);
      loadProducts();
    } finally {
      setTogglingId(null);
    }
  };

  const toggleNewDrop = async (id) => {
    try {
      await api.patch(`/admin/products/${id}/new-drop`);
      loadProducts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Product Management</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Manage your catalogue, stock and visibility</p>
        </div>
        <Link
          to="/admin/products/new"
          className="flex items-center gap-2 rounded-xl bg-accent text-[#0f0f0f] px-5 py-2.5 text-sm font-semibold hover:bg-accent/90 transition-all duration-200 shadow-lg shadow-accent/10"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Products", value: products.length, color: "text-white" },
          { label: "Total Stock", value: totalStock, color: "text-accent" },
          { label: "Hidden", value: hiddenCount, color: "text-zinc-400" },
          { label: "New Drops", value: newDropCount, color: "text-amber-400" },
        ].map((s) => (
          <div key={s.label} className="bg-[#141414] border border-[#262626] rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-zinc-600 uppercase tracking-widest mt-0.5">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.section
        variants={fadeUp}
        className="bg-[#141414] rounded-2xl border border-[#262626] p-5 space-y-4"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative lg:col-span-1 sm:col-span-2">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              placeholder="Search by name…"
              className={inputClass + " pl-10"}
              value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && loadProducts()}
            />
          </div>
          <select
            className={inputClass}
            value={filters.stockStatus}
            onChange={(e) => setFilters({ ...filters, stockStatus: e.target.value })}
          >
            <option value="">All stock levels</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
          <select
            className={inputClass}
            value={filters.visibility}
            onChange={(e) => setFilters({ ...filters, visibility: e.target.value })}
          >
            <option value="">All visibility</option>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </select>
          <select
            className={inputClass}
            value={filters.newDrop}
            onChange={(e) => setFilters({ ...filters, newDrop: e.target.value })}
          >
            <option value="">All drops</option>
            <option value="true">New drop only</option>
          </select>
        </div>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <button
            onClick={loadProducts}
            className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-[#0f0f0f] hover:bg-accent/90 transition-all duration-200"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Apply Filters
          </button>
          {(filters.q || filters.stockStatus || filters.visibility || filters.newDrop) && (
            <button
              onClick={() => { setFilters({ q: "", stockStatus: "", visibility: "", newDrop: "" }); }}
              className="text-xs text-zinc-500 hover:text-white transition-colors duration-150 underline underline-offset-2"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Bulk actions */}
        <AnimatePresence>
          {selected.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-[#222] pt-4 flex flex-wrap items-center gap-3"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-accent/20 border border-accent/40 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-accent">{selected.length}</span>
                </div>
                <span className="text-xs text-zinc-400">
                  {selected.length} product{selected.length !== 1 ? "s" : ""} selected
                </span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  disabled={bulkLoading}
                  onClick={() => handleBulkAction("hide")}
                  className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1.5 text-[11px] font-medium text-zinc-300 hover:text-white hover:bg-[#222] transition-all duration-150 disabled:opacity-50"
                >
                  Hide All
                </button>
                <button
                  disabled={bulkLoading}
                  onClick={() => handleBulkAction("update_price")}
                  className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1.5 text-[11px] font-medium text-zinc-300 hover:text-white hover:bg-[#222] transition-all duration-150 disabled:opacity-50"
                >
                  Set Price
                </button>
                <button
                  disabled={bulkLoading}
                  onClick={() => handleBulkAction("delete")}
                  className="rounded-lg border border-red-900/40 bg-red-900/10 px-3 py-1.5 text-[11px] font-medium text-red-400 hover:bg-red-900/25 transition-all duration-150 disabled:opacity-50"
                >
                  Delete All
                </button>
                <button
                  onClick={() => setSelected([])}
                  className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors px-1"
                >
                  Clear
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Table */}
      <motion.section
        variants={fadeUp}
        className="bg-[#141414] rounded-2xl border border-[#262626] overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-[#1e1e1e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-[#333] flex items-center justify-center">
              <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-white">All Products</h2>
          </div>
          <span className="text-[11px] font-semibold text-zinc-500 bg-[#1e1e1e] border border-[#2a2a2a] px-2.5 py-1 rounded-full">
            {products.length} {products.length === 1 ? "product" : "products"}
          </span>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-[#1a1a1a] rounded-xl animate-pulse border border-[#222]" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-sm font-medium text-zinc-400">No products found</p>
            <p className="text-xs text-zinc-600 mt-1">Try adjusting your filters or add a new product.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm min-w-[860px]">
                <thead>
                  <tr className="border-b border-[#1e1e1e]">
                    <th className="px-5 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={selected.length === products.length && products.length > 0}
                        onChange={selectAll}
                        className="w-4 h-4 rounded border-zinc-700 bg-[#111] accent-accent cursor-pointer"
                      />
                    </th>
                    {["Product", "Price", "Stock", "Visibility", "New Drop", ""].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[10px] uppercase tracking-widest font-semibold text-zinc-600"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c1c1c]">
                  <AnimatePresence>
                    {products.map((p, i) => {
                      const stock = (p.variants || []).reduce(
                        (s, v) => s + (v.stock || 0),
                        0
                      );
                      const isProcessing =
                        deletingId === p._id || togglingId === p._id;

                      return (
                        <motion.tr
                          key={p._id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -12 }}
                          transition={{ delay: i * 0.03 }}
                          className={`group hover:bg-[#1a1a1a] transition-colors duration-150 ${isProcessing ? "opacity-40 pointer-events-none" : ""
                            } ${selected.includes(p._id) ? "bg-accent/5" : ""}`}
                        >
                          <td className="px-5 py-3.5">
                            <input
                              type="checkbox"
                              checked={selected.includes(p._id)}
                              onChange={() => toggleSelect(p._id)}
                              className="w-4 h-4 rounded border-zinc-700 bg-[#111] accent-accent cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <ProductImage product={p} />
                              <div>
                                <p className="font-semibold text-white text-sm leading-tight">
                                  {p.name}
                                </p>
                                {p.category && (
                                  <p className="text-[11px] text-zinc-600 mt-0.5">
                                    {typeof p.category === "object" ? p.category?.name ?? "" : p.category}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-sm font-semibold text-white">
                              ₹{(p.price || 0).toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <StockBadge stock={stock} />
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border ${p.isVisible
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                                : "bg-zinc-800/60 text-zinc-500 border-zinc-700/60"
                                }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${p.isVisible ? "bg-emerald-400" : "bg-zinc-600"
                                  }`}
                              />
                              {p.isVisible ? "Visible" : "Hidden"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            {p.isNewDrop ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 text-[11px] font-semibold text-amber-400">
                                ✦ New Drop
                              </span>
                            ) : (
                              <span className="text-[11px] text-zinc-700">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                              <button
                                onClick={() => navigate(`/admin/products/edit/${p._id}`)}
                                className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1.5 text-[11px] font-medium text-zinc-300 hover:text-white hover:border-zinc-600 hover:bg-[#222] transition-all duration-150"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => toggleVisibility(p._id)}
                                className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1.5 text-[11px] font-medium text-zinc-300 hover:text-white hover:border-zinc-600 hover:bg-[#222] transition-all duration-150"
                              >
                                {p.isVisible ? "Hide" : "Show"}
                              </button>
                              <button
                                onClick={() => toggleNewDrop(p._id)}
                                className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1.5 text-[11px] font-medium text-zinc-300 hover:text-white hover:border-zinc-600 hover:bg-[#222] transition-all duration-150"
                              >
                                {p.isNewDrop ? "Undrop" : "New Drop"}
                              </button>
                              <button
                                onClick={() => remove(p._id)}
                                className="rounded-lg border border-red-900/40 bg-red-900/10 px-3 py-1.5 text-[11px] font-medium text-red-400 hover:bg-red-900/25 hover:border-red-700/60 transition-all duration-150"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-[#1c1c1c]">
              {products.map((p, i) => {
                const stock = (p.variants || []).reduce((s, v) => s + (v.stock || 0), 0);
                return (
                  <motion.div
                    key={p._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className={`p-4 space-y-3 ${selected.includes(p._id) ? "bg-accent/5" : ""
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(p._id)}
                        onChange={() => toggleSelect(p._id)}
                        className="mt-1 w-4 h-4 rounded border-zinc-700 bg-[#111] accent-accent cursor-pointer"
                      />
                      <ProductImage product={p} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm leading-tight truncate">{p.name}</p>
                        <p className="text-sm font-bold text-accent mt-0.5">₹{(p.price || 0).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-10">
                      <StockBadge stock={stock} />
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold border ${p.isVisible
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                        : "bg-zinc-800/60 text-zinc-500 border-zinc-700/60"
                        }`}>
                        {p.isVisible ? "Visible" : "Hidden"}
                      </span>
                      {p.isNewDrop && (
                        <span className="inline-flex items-center rounded-full bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 text-[11px] font-semibold text-amber-400">
                          ✦ New Drop
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 ml-10">
                      <button
                        onClick={() => navigate(`/admin/products/edit/${p._id}`)}
                        className="flex-1 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] py-2 text-[11px] font-medium text-zinc-300 hover:text-white hover:bg-[#222] transition-all duration-150"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleVisibility(p._id)}
                        className="flex-1 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] py-2 text-[11px] font-medium text-zinc-300 hover:text-white hover:bg-[#222] transition-all duration-150"
                      >
                        {p.isVisible ? "Hide" : "Show"}
                      </button>
                      <button
                        onClick={() => remove(p._id)}
                        className="flex-1 rounded-lg border border-red-900/40 bg-red-900/10 py-2 text-[11px] font-medium text-red-400 hover:bg-red-900/25 transition-all duration-150"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </motion.section>
    </motion.div>
  );
}