import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../../api/client.js";
import { LoadingSkeleton } from "../../../components/ui/LoadingSkeleton.jsx";

const initialForm = {
  code: "",
  discountType: "percentage",
  value: 10,
  minOrder: 0,
  expiry: "",
  usageLimit: "",
  active: true,
};

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

function StatusPill({ active, expired }) {
  return (
    <div className="flex flex-col gap-1">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide border transition-colors duration-200 ${active
          ? "bg-accent/10 text-accent border-accent/30"
          : "bg-zinc-800/60 text-zinc-400 border-zinc-700/60"
          }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${active ? "bg-accent" : "bg-zinc-500"}`}
        />
        {active ? "Active" : "Inactive"}
      </span>
      {expired && (
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide bg-red-500/10 text-red-400 border border-red-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
          Expired
        </span>
      )}
    </div>
  );
}

function InputField({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          {label}
        </label>
      )}
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-[#262626] bg-[#111111] px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/10 transition-all duration-200";

export function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get("/admin/coupons")
      .then(({ data }) => setCoupons(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/admin/coupons/${editingId}`, form);
      } else {
        await api.post("/admin/coupons", form);
      }
      setForm(initialForm);
      setEditingId(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (coupon) => {
    setEditingId(coupon._id);
    setForm({
      code: coupon.code || "",
      discountType: coupon.discountType || "percentage",
      value: coupon.value ?? 0,
      minOrder: coupon.minOrder ?? 0,
      expiry: coupon.expiry ? coupon.expiry.slice(0, 10) : "",
      usageLimit: coupon.usageLimit ?? "",
      active: coupon.active ?? true,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  const toggleActive = async (id) => {
    await api.patch(`/admin/coupons/${id}/toggle`);
    load();
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this coupon? This cannot be undone.")) return;
    setDeletingId(id);
    await api.delete(`/admin/coupons/${id}`);
    setDeletingId(null);
    load();
  };

  const now = new Date();

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="space-y-6 max-w-6xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Coupons & Promotions
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Manage discount codes for your customers
          </p>
        </div>
        <AnimatePresence>
          {editingId && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              type="button"
              onClick={resetForm}
              className="flex items-center gap-2 text-xs rounded-xl border border-[#262626] px-4 py-2 text-zinc-400 hover:text-white hover:bg-[#222] hover:border-zinc-600 transition-all duration-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel edit
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Form */}
      <motion.section
        variants={fadeUp}
        className="relative bg-[#141414] rounded-2xl border border-[#262626] overflow-hidden"
      >
        {/* Accent top bar */}
        <div className="h-0.5 w-full bg-gradient-to-r from-accent/60 via-accent to-accent/20" />

        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                {editingId ? "Edit Coupon" : "Create New Coupon"}
              </h2>
              <p className="text-[11px] text-zinc-500">
                {editingId ? "Update the fields below and save" : "Fill in the details to add a new discount"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <InputField label="Coupon Code">
                <input
                  className={inputClass + " uppercase font-mono tracking-widest"}
                  placeholder="e.g. SAVE20"
                  value={form.code}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
                  }
                  required
                />
              </InputField>

              <InputField label="Discount Type">
                <select
                  className={inputClass}
                  value={form.discountType}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, discountType: e.target.value }))
                  }
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </InputField>

              <InputField label={form.discountType === "percentage" ? "Discount Value (%)" : "Discount Value (₹)"}>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className={inputClass}
                  placeholder={form.discountType === "percentage" ? "10" : "50.00"}
                  value={form.value}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, value: Number(e.target.value) || 0 }))
                  }
                  required
                />
              </InputField>

              <InputField label="Minimum Order (₹)">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className={inputClass}
                  placeholder="0.00"
                  value={form.minOrder}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, minOrder: Number(e.target.value) || 0 }))
                  }
                />
              </InputField>

              <InputField label="Expiry Date">
                <input
                  type="date"
                  className={inputClass}
                  value={form.expiry}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, expiry: e.target.value }))
                  }
                  required
                />
              </InputField>

              <InputField label="Usage Limit">
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  placeholder="Unlimited"
                  value={form.usageLimit}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      usageLimit: e.target.value === "" ? "" : Number(e.target.value),
                    }))
                  }
                />
              </InputField>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#222]">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative" onClick={() => setForm((f) => ({ ...f, active: !f.active }))}>
                  <div
                    className={`w-10 h-6 rounded-full border transition-all duration-200 ${form.active
                      ? "bg-accent/20 border-accent/40"
                      : "bg-[#1a1a1a] border-[#333]"
                      }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full mt-0.5 transition-all duration-200 ${form.active
                        ? "translate-x-5 bg-accent"
                        : "translate-x-0.5 bg-zinc-600"
                        }`}
                    />
                  </div>
                </div>
                <span className="text-sm text-zinc-400 group-hover:text-white transition-colors duration-150">
                  Activate coupon immediately
                </span>
              </label>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-[#0f0f0f] hover:bg-accent/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-accent/10"
              >
                {saving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {editingId ? "Saving..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      {editingId ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      )}
                    </svg>
                    {editingId ? "Save Changes" : "Create Coupon"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.section>

      {/* Coupon List */}
      <motion.section variants={fadeUp} className="bg-[#141414] rounded-2xl border border-[#262626] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1e1e1e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-[#333] flex items-center justify-center">
              <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-white">All Coupons</h2>
          </div>
          <span className="text-[11px] font-semibold text-zinc-500 bg-[#1e1e1e] border border-[#2a2a2a] px-2.5 py-1 rounded-full">
            {coupons.length} {coupons.length === 1 ? "coupon" : "coupons"}
          </span>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-[#1a1a1a] rounded-xl animate-pulse border border-[#222]" />
            ))}
          </div>
        ) : coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-zinc-400">No coupons yet</p>
            <p className="text-xs text-zinc-600 mt-1">Create your first coupon using the form above.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1e1e1e]">
                    {["Code", "Type", "Value", "Min Order", "Expiry", "Usage", "Status", ""].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-[10px] uppercase tracking-widest font-semibold text-zinc-600"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c1c1c]">
                  <AnimatePresence>
                    {coupons.map((c, i) => {
                      const expiryDate = c.expiry ? new Date(c.expiry) : null;
                      const isExpired = expiryDate && expiryDate < now;
                      const used = c.usedCount ?? 0;
                      const limit = c.usageLimit ?? null;
                      const usageLabel = limit ? `${used} / ${limit}` : `${used} / ∞`;
                      const usagePct = limit ? Math.min((used / limit) * 100, 100) : 0;

                      return (
                        <motion.tr
                          key={c._id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -16 }}
                          transition={{ delay: i * 0.04 }}
                          className={`group hover:bg-[#1a1a1a] transition-colors duration-150 ${deletingId === c._id ? "opacity-40 pointer-events-none" : ""
                            }`}
                        >
                          <td className="px-5 py-3.5">
                            <span className="font-mono font-bold text-white tracking-wider text-xs bg-[#1e1e1e] border border-[#2a2a2a] px-2.5 py-1.5 rounded-lg">
                              {c.code}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-xs text-zinc-400 capitalize">{c.discountType}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-sm font-semibold text-accent">
                              {c.discountType === "percentage"
                                ? `${c.value}%`
                                : `₹${(c.value || 0).toFixed(2)}`}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-zinc-400">
                            {c.minOrder ? `₹${c.minOrder.toFixed(2)}` : <span className="text-zinc-600">—</span>}
                          </td>
                          <td className="px-5 py-3.5 text-xs">
                            {expiryDate ? (
                              <span className={isExpired ? "text-red-400" : "text-zinc-400"}>
                                {expiryDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              </span>
                            ) : (
                              <span className="text-zinc-600">—</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="space-y-1.5 min-w-[80px]">
                              <span className="text-xs text-zinc-400 font-mono">{usageLabel}</span>
                              {limit > 0 && (
                                <div className="w-full h-1 bg-[#222] rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                      width: `${usagePct}%`,
                                      background: usagePct > 80 ? "#ef4444" : "#a6c655",
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <StatusPill active={c.active} expired={isExpired} />
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                              <button
                                type="button"
                                onClick={() => startEdit(c)}
                                className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1.5 text-[11px] font-medium text-zinc-300 hover:text-white hover:border-zinc-600 hover:bg-[#222] transition-all duration-150"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleActive(c._id)}
                                className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1.5 text-[11px] font-medium text-zinc-300 hover:text-white hover:border-zinc-600 hover:bg-[#222] transition-all duration-150"
                              >
                                {c.active ? "Disable" : "Enable"}
                              </button>
                              <button
                                type="button"
                                onClick={() => remove(c._id)}
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
            <div className="md:hidden divide-y divide-[#1e1e1e]">
              {coupons.map((c, i) => {
                const expiryDate = c.expiry ? new Date(c.expiry) : null;
                const isExpired = expiryDate && expiryDate < now;
                const used = c.usedCount ?? 0;
                const limit = c.usageLimit ?? null;

                return (
                  <motion.div
                    key={c._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="font-mono font-bold text-white tracking-widest text-sm bg-[#1e1e1e] border border-[#2a2a2a] px-2.5 py-1 rounded-lg inline-block">
                          {c.code}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          <span className="capitalize">{c.discountType}</span>
                          <span>·</span>
                          <span className="text-accent font-semibold">
                            {c.discountType === "percentage"
                              ? `${c.value}%`
                              : `₹${(c.value || 0).toFixed(2)}`}
                          </span>
                        </div>
                      </div>
                      <StatusPill active={c.active} expired={isExpired} />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-[#111] rounded-lg p-2.5 border border-[#222]">
                        <p className="text-zinc-600 mb-1">Min order</p>
                        <p className="text-white font-medium">{c.minOrder ? `₹${c.minOrder.toFixed(2)}` : "None"}</p>
                      </div>
                      <div className="bg-[#111] rounded-lg p-2.5 border border-[#222]">
                        <p className="text-zinc-600 mb-1">Expires</p>
                        <p className={`font-medium ${isExpired ? "text-red-400" : "text-white"}`}>
                          {expiryDate
                            ? expiryDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                            : "—"}
                        </p>
                      </div>
                      <div className="bg-[#111] rounded-lg p-2.5 border border-[#222]">
                        <p className="text-zinc-600 mb-1">Used</p>
                        <p className="text-white font-medium">{used}{limit ? `/${limit}` : ""}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => startEdit(c)}
                        className="flex-1 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-[#222] transition-all duration-150"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleActive(c._id)}
                        className="flex-1 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-[#222] transition-all duration-150"
                      >
                        {c.active ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => remove(c._id)}
                        className="flex-1 rounded-lg border border-red-900/40 bg-red-900/10 py-2 text-xs font-medium text-red-400 hover:bg-red-900/25 transition-all duration-150"
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