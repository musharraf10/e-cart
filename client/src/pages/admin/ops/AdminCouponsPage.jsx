import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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

export function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get("/admin/coupons")
      .then(({ data }) => setCoupons(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

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
    await api.delete(`/admin/coupons/${id}`);
    load();
  };

  const now = new Date();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Coupons & Promotions
        </h1>
        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            className="text-xs rounded-xl border border-[#262626] px-3 py-1.5 text-muted hover:text-white hover:bg-[#262626]"
          >
            Cancel edit
          </button>
        )}
      </div>

      <section className="bg-card rounded-xl border border-[#262626] p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white">
          {editingId ? "Edit coupon" : "Create coupon"}
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid gap-3 md:grid-cols-3 text-sm"
        >
          <input
            className="rounded-xl border border-[#262626] bg-primary px-3 py-2 text-white placeholder-muted focus:outline-none focus:border-accent"
            placeholder="Coupon code"
            value={form.code}
            onChange={(e) =>
              setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
            }
            required
          />
          <select
            className="rounded-xl border border-[#262626] bg-primary px-3 py-2 text-white focus:outline-none focus:border-accent"
            value={form.discountType}
            onChange={(e) =>
              setForm((f) => ({ ...f, discountType: e.target.value }))
            }
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed amount</option>
          </select>
          <input
            type="number"
            min={0}
            step="0.01"
            className="rounded-xl border border-[#262626] bg-primary px-3 py-2 text-white placeholder-muted focus:outline-none focus:border-accent"
            placeholder={
              form.discountType === "percentage"
                ? "Value (%)"
                : "Value (fixed amount)"
            }
            value={form.value}
            onChange={(e) =>
              setForm((f) => ({ ...f, value: Number(e.target.value) || 0 }))
            }
            required
          />
          <input
            type="number"
            min={0}
            step="0.01"
            className="rounded-xl border border-[#262626] bg-primary px-3 py-2 text-white placeholder-muted focus:outline-none focus:border-accent"
            placeholder="Minimum order amount"
            value={form.minOrder}
            onChange={(e) =>
              setForm((f) => ({ ...f, minOrder: Number(e.target.value) || 0 }))
            }
          />
          <input
            type="date"
            className="rounded-xl border border-[#262626] bg-primary px-3 py-2 text-white placeholder-muted focus:outline-none focus:border-accent"
            value={form.expiry}
            onChange={(e) =>
              setForm((f) => ({ ...f, expiry: e.target.value }))
            }
            required
          />
          <input
            type="number"
            min={0}
            className="rounded-xl border border-[#262626] bg-primary px-3 py-2 text-white placeholder-muted focus:outline-none focus:border-accent"
            placeholder="Usage limit (optional)"
            value={form.usageLimit}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                usageLimit: e.target.value === "" ? "" : Number(e.target.value),
              }))
            }
          />
          <label className="flex items-center gap-2 text-xs text-muted md:col-span-3">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-[#262626] bg-primary"
              checked={form.active}
              onChange={(e) =>
                setForm((f) => ({ ...f, active: e.target.checked }))
              }
            />
            Active
          </label>
          <button
            type="submit"
            disabled={saving}
            className="md:col-span-3 rounded-xl bg-accent text-primary py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-60"
          >
            {saving
              ? editingId
                ? "Saving changes..."
                : "Creating..."
              : editingId
              ? "Save changes"
              : "Create coupon"}
          </button>
        </form>
      </section>

      <section className="bg-card rounded-xl border border-[#262626] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">All coupons</h2>
          <p className="text-xs text-muted">
            {coupons.length} coupon{coupons.length === 1 ? "" : "s"}
          </p>
        </div>

        {loading ? (
          <div className="space-y-2">
            <LoadingSkeleton className="h-10 w-full" />
            <LoadingSkeleton className="h-10 w-full" />
            <LoadingSkeleton className="h-10 w-full" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#262626] py-10 text-center text-sm text-muted">
            No coupons yet. Create your first coupon above.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <table className="min-w-full text-sm text-left border-separate border-spacing-y-2 px-4 md:px-0">
              <thead>
                <tr className="text-xs uppercase text-muted">
                  <th className="px-4 py-2">Code</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Value</th>
                  <th className="px-4 py-2">Min order</th>
                  <th className="px-4 py-2">Expiry</th>
                  <th className="px-4 py-2">Usage</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => {
                  const expiryDate = c.expiry ? new Date(c.expiry) : null;
                  const isExpired = expiryDate && expiryDate < now;
                  const used = c.usedCount ?? 0;
                  const limit = c.usageLimit ?? null;
                  const usageLabel = limit ? `${used}/${limit}` : `${used} / ∞`;

                  return (
                    <tr key={c._id}>
                      <td className="px-4">
                        <div className="bg-[#171717] rounded-xl border border-[#262626] px-3 py-2">
                          <div className="font-semibold text-white">
                            {c.code}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 align-top">
                        <div className="bg-[#171717] rounded-xl border border-[#262626] px-3 py-2 text-xs text-muted capitalize">
                          {c.discountType}
                        </div>
                      </td>
                      <td className="px-4 align-top">
                        <div className="bg-[#171717] rounded-xl border border-[#262626] px-3 py-2 text-xs text-white">
                          {c.discountType === "percentage"
                            ? `${c.value}%`
                            : `₹${(c.value || 0).toFixed(2)}`}
                        </div>
                      </td>
                      <td className="px-4 align-top">
                        <div className="bg-[#171717] rounded-xl border border-[#262626] px-3 py-2 text-xs text-white">
                          {c.minOrder ? `₹${c.minOrder.toFixed(2)}` : "None"}
                        </div>
                      </td>
                      <td className="px-4 align-top">
                        <div className="bg-[#171717] rounded-xl border border-[#262626] px-3 py-2 text-xs text-white">
                          {expiryDate
                            ? expiryDate.toLocaleDateString()
                            : "—"}
                        </div>
                      </td>
                      <td className="px-4 align-top">
                        <div className="bg-[#171717] rounded-xl border border-[#262626] px-3 py-2 text-xs text-white">
                          {usageLabel}
                        </div>
                      </td>
                      <td className="px-4 align-top">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                              c.active
                                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                                : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                            }`}
                          >
                            {c.active ? "Active" : "Inactive"}
                          </span>
                          {isExpired && (
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-red-500/10 text-red-300 border border-red-500/40">
                              Expired
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 align-top text-right">
                        <div className="flex justify-end gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => startEdit(c)}
                            className="rounded-xl border border-[#262626] px-3 py-1.5 text-muted hover:text-white hover:bg-[#262626]"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleActive(c._id)}
                            className="rounded-xl border border-[#262626] px-3 py-1.5 text-muted hover:text-white hover:bg-[#262626]"
                          >
                            {c.active ? "Disable" : "Enable"}
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(c._id)}
                            className="rounded-xl border border-red-900/60 bg-red-900/20 px-3 py-1.5 text-red-300 hover:bg-red-900/40"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </motion.div>
  );
}
