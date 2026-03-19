import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../../api/client.js";
import { LoadingSkeleton } from "../../../components/ui/LoadingSkeleton.jsx";

const initialForm = {
  text: "",
  type: "general",
  active: true,
};

export function AdminAnnouncementsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get("/admin/announcements")
      .then(({ data }) => setItems(data || []))
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
        await api.put(`/admin/announcements/${editingId}`, form);
      } else {
        await api.post("/admin/announcements", form);
      }
      setForm(initialForm);
      setEditingId(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({
      text: item.text || "",
      type: item.type || "general",
      active: item.active ?? true,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  const toggleActive = async (id) => {
    await api.patch(`/admin/announcements/${id}/toggle`);
    load();
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    await api.delete(`/admin/announcements/${id}`);
    load();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Announcements
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
          {editingId ? "Edit announcement" : "Create announcement"}
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid gap-3 md:grid-cols-3 text-sm"
        >
          <textarea
            rows={2}
            className="md:col-span-3 rounded-xl border border-[#262626] bg-primary px-3 py-2 text-white placeholder-muted focus:outline-none focus:border-accent resize-none"
            placeholder="Message text"
            value={form.text}
            onChange={(e) =>
              setForm((f) => ({ ...f, text: e.target.value }))
            }
            required
          />
          <select
            className="rounded-xl border border-[#262626] bg-primary px-3 py-2 text-white focus:outline-none focus:border-accent"
            value={form.type}
            onChange={(e) =>
              setForm((f) => ({ ...f, type: e.target.value }))
            }
          >
            <option value="general">General</option>
            <option value="offer">Offer</option>
            <option value="coupon">Coupon</option>
          </select>
          <label className="flex items-center gap-2 text-xs text-muted">
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
                ? "Saving..."
                : "Creating..."
              : editingId
              ? "Save changes"
              : "Create announcement"}
          </button>
        </form>
      </section>

      <section className="bg-card rounded-xl border border-[#262626] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">
            Existing announcements
          </h2>
          <p className="text-xs text-muted">
            {items.length} item{items.length === 1 ? "" : "s"}
          </p>
        </div>

        {loading ? (
          <div className="space-y-2">
            <LoadingSkeleton className="h-10 w-full" />
            <LoadingSkeleton className="h-10 w-full" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#262626] py-10 text-center text-sm text-muted">
            No announcements yet. Create one above.
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            {items.map((a) => (
              <div
                key={a._id}
                className="bg-[#171717] rounded-xl border border-[#262626] p-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="text-white text-sm">{a.text}</div>
                  <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-muted">
                    <span className="inline-flex items-center rounded-full border border-[#262626] px-2 py-0.5 capitalize">
                      {a.type}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-[#262626] px-2 py-0.5">
                      Created{" "}
                      {new Date(a.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${
                        a.active
                          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                          : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                      }`}
                    >
                      {a.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-2 md:mt-0 text-xs">
                  <button
                    type="button"
                    onClick={() => startEdit(a)}
                    className="rounded-xl border border-[#262626] px-3 py-1.5 text-muted hover:text-white hover:bg-[#262626]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleActive(a._id)}
                    className="rounded-xl border border-[#262626] px-3 py-1.5 text-muted hover:text-white hover:bg-[#262626]"
                  >
                    {a.active ? "Disable" : "Enable"}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(a._id)}
                    className="rounded-xl border border-red-900/60 bg-red-900/20 px-3 py-1.5 text-red-300 hover:bg-red-900/40"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}

