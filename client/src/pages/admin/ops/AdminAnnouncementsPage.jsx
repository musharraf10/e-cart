import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../../api/client.js";

const initialForm = {
  text: "",
  type: "general",
  active: true,
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const TYPE_CONFIG = {
  general: {
    label: "General",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    colors: "bg-blue-500/10 text-blue-400 border-blue-500/25",
    dot: "bg-blue-400",
  },
  offer: {
    label: "Offer",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      </svg>
    ),
    colors: "bg-amber-500/10 text-amber-400 border-amber-500/25",
    dot: "bg-amber-400",
  },
  coupon: {
    label: "Coupon",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    colors: "bg-accent/10 text-accent border-accent/25",
    dot: "bg-accent",
  },
};

function TypeBadge({ type }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.general;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border ${cfg.colors}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function StatusPill({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border transition-colors duration-200 ${active
        ? "bg-accent/10 text-accent border-accent/30"
        : "bg-zinc-800/60 text-zinc-400 border-zinc-700/60"
        }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-accent" : "bg-zinc-500"}`} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

const inputClass =
  "w-full rounded-xl border border-[#262626] bg-[#111111] px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/10 transition-all duration-200";

export function AdminAnnouncementsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get("/admin/announcements")
      .then(({ data }) => setItems(data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

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
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    setDeletingId(id);
    await api.delete(`/admin/announcements/${id}`);
    setDeletingId(null);
    load();
  };

  const activeCount = items.filter((i) => i.active).length;

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
          <h1 className="text-2xl font-bold tracking-tight text-white">Announcements</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Broadcast messages to your customers
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

      {/* Stats row */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: items.length, color: "text-white" },
          { label: "Active", value: activeCount, color: "text-accent" },
          { label: "Inactive", value: items.length - activeCount, color: "text-zinc-400" },
        ].map((s) => (
          <div key={s.label} className="bg-[#141414] border border-[#262626] rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-zinc-600 uppercase tracking-widest mt-0.5">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Form */}
      <motion.section
        variants={fadeUp}
        className="relative bg-[#141414] rounded-2xl border border-[#262626] overflow-hidden"
      >
        <div className="h-0.5 w-full bg-gradient-to-r from-accent/60 via-accent to-accent/20" />
        <div className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                {editingId ? "Edit Announcement" : "Create Announcement"}
              </h2>
              <p className="text-[11px] text-zinc-500">
                {editingId ? "Update the message below" : "Add a new announcement to display to users"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Message textarea */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                Message
              </label>
              <textarea
                rows={3}
                className={inputClass + " resize-none"}
                placeholder="Write your announcement message here…"
                value={form.text}
                onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
                required
              />
              <p className="text-[11px] text-zinc-600 text-right">{form.text.length} characters</p>
            </div>

            {/* Type + Toggle row */}
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                  Type
                </label>
                <div className="flex gap-2">
                  {Object.entries(TYPE_CONFIG).map(([val, cfg]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, type: val }))}
                      className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-medium transition-all duration-150 ${form.type === val
                        ? cfg.colors + " shadow-sm"
                        : "border-[#262626] bg-[#111] text-zinc-500 hover:text-zinc-300 hover:border-zinc-600"
                        }`}
                    >
                      {cfg.icon}
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer group pb-0.5">
                <div
                  className="relative"
                  onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
                >
                  <div
                    className={`w-10 h-6 rounded-full border transition-all duration-200 ${form.active ? "bg-accent/20 border-accent/40" : "bg-[#1a1a1a] border-[#333]"
                      }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full mt-0.5 transition-all duration-200 ${form.active ? "translate-x-5 bg-accent" : "translate-x-0.5 bg-zinc-600"
                        }`}
                    />
                  </div>
                </div>
                <span className="text-sm text-zinc-400 group-hover:text-white transition-colors duration-150">
                  Activate immediately
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
                    {editingId ? "Save Changes" : "Publish"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.section>

      {/* List */}
      <motion.section variants={fadeUp} className="bg-[#141414] rounded-2xl border border-[#262626] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1e1e1e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-[#333] flex items-center justify-center">
              <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-white">All Announcements</h2>
          </div>
          <span className="text-[11px] font-semibold text-zinc-500 bg-[#1e1e1e] border border-[#2a2a2a] px-2.5 py-1 rounded-full">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-[#1a1a1a] rounded-xl animate-pulse border border-[#222]" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-zinc-400">No announcements yet</p>
            <p className="text-xs text-zinc-600 mt-1">Create your first announcement using the form above.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1c1c1c]">
            <AnimatePresence>
              {items.map((a, i) => (
                <motion.div
                  key={a._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ delay: i * 0.04 }}
                  className={`group px-5 py-4 hover:bg-[#1a1a1a] transition-colors duration-150 ${deletingId === a._id ? "opacity-40 pointer-events-none" : ""
                    }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    {/* Left: message + meta */}
                    <div className="flex gap-3 min-w-0">
                      {/* Type dot accent */}
                      <div
                        className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${TYPE_CONFIG[a.type]?.dot ?? "bg-zinc-500"
                          }`}
                      />
                      <div className="min-w-0">
                        <p className="text-sm text-white leading-relaxed">{a.text}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <TypeBadge type={a.type} />
                          <StatusPill active={a.active} />
                          {a.createdAt && (
                            <span className="text-[11px] text-zinc-600">
                              {new Date(a.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
                      <button
                        type="button"
                        onClick={() => startEdit(a)}
                        className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1.5 text-[11px] font-medium text-zinc-300 hover:text-white hover:border-zinc-600 hover:bg-[#222] transition-all duration-150"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleActive(a._id)}
                        className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1.5 text-[11px] font-medium text-zinc-300 hover:text-white hover:border-zinc-600 hover:bg-[#222] transition-all duration-150"
                      >
                        {a.active ? "Disable" : "Enable"}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(a._id)}
                        className="rounded-lg border border-red-900/40 bg-red-900/10 px-3 py-1.5 text-[11px] font-medium text-red-400 hover:bg-red-900/25 hover:border-red-700/60 transition-all duration-150"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.section>
    </motion.div>
  );
}