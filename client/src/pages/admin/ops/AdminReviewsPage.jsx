import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../../api/client.js";

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: -12 },
};

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-3.5 h-3.5 ${s <= rating ? "text-amber-400" : "text-zinc-700"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-[11px] font-semibold text-amber-400">{rating}/5</span>
    </div>
  );
}

function Avatar({ name }) {
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const colors = [
    "from-violet-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-pink-500 to-rose-600",
    "from-accent/80 to-emerald-600",
  ];
  const color = colors[(name?.charCodeAt(0) ?? 0) % colors.length];
  return (
    <div
      className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0`}
    >
      {initials}
    </div>
  );
}

const FILTERS = ["All", "Visible", "Hidden"];

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get("/admin/reviews")
      .then(({ data }) => setReviews(data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (r) => {
    setTogglingId(r._id);
    const action = r.isHidden ? "unhide" : "hide";
    await api.patch(`/admin/reviews/${r._id}/${action}`);
    setTogglingId(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review? This cannot be undone.")) return;
    setDeletingId(id);
    await api.delete(`/admin/reviews/${id}`);
    setDeletingId(null);
    load();
  };

  const filtered = reviews.filter((r) => {
    const matchFilter =
      filter === "All" ||
      (filter === "Hidden" && r.isHidden) ||
      (filter === "Visible" && !r.isHidden);
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.user?.name?.toLowerCase().includes(q) ||
      r.product?.name?.toLowerCase().includes(q) ||
      r.comment?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const hiddenCount = reviews.filter((r) => r.isHidden).length;
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : "—";

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="space-y-6 max-w-6xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold tracking-tight text-white">Review Moderation</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Monitor and manage customer reviews</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: reviews.length, color: "text-white" },
          { label: "Avg Rating", value: avgRating, color: "text-amber-400" },
          { label: "Hidden", value: hiddenCount, color: "text-zinc-400" },
        ].map((s) => (
          <div key={s.label} className="bg-[#141414] border border-[#262626] rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-zinc-600 uppercase tracking-widest mt-0.5">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Filters + Search */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 p-1 bg-[#141414] border border-[#262626] rounded-xl">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${filter === f
                ? "bg-accent text-[#0f0f0f]"
                : "text-zinc-500 hover:text-white"
                }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="w-full rounded-xl border border-[#262626] bg-[#141414] pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/10 transition-all duration-200"
            placeholder="Search by user, product or comment…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </motion.div>

      {/* List */}
      <motion.section variants={fadeUp} className="bg-[#141414] rounded-2xl border border-[#262626] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1e1e1e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-[#333] flex items-center justify-center">
              <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-white">Reviews</h2>
          </div>
          <span className="text-[11px] font-semibold text-zinc-500 bg-[#1e1e1e] border border-[#2a2a2a] px-2.5 py-1 rounded-full">
            {filtered.length} {filtered.length === 1 ? "review" : "reviews"}
          </span>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-[#1a1a1a] rounded-xl animate-pulse border border-[#222]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-zinc-400">No reviews found</p>
            <p className="text-xs text-zinc-600 mt-1">
              {search ? "Try a different search term." : "No reviews match the current filter."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#1c1c1c]">
            <AnimatePresence>
              {filtered.map((r, i) => (
                <motion.div
                  key={r._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ delay: i * 0.04 }}
                  className={`group px-5 py-4 hover:bg-[#1a1a1a] transition-colors duration-150 ${deletingId === r._id || togglingId === r._id
                    ? "opacity-40 pointer-events-none"
                    : ""
                    } ${r.isHidden ? "opacity-60" : ""}`}
                >
                  <div className="flex gap-3">
                    <Avatar name={r.user?.name} />

                    <div className="flex-1 min-w-0">
                      {/* Top row */}
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-white">
                              {r.user?.name || "Anonymous"}
                            </span>
                            {r.isHidden && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 border border-zinc-700 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                                Hidden
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <StarRating rating={r.rating} />
                            {r.product?.name && (
                              <>
                                <span className="text-zinc-700 text-xs">·</span>
                                <span className="text-xs text-zinc-500 truncate max-w-[180px]">
                                  {r.product.name}
                                </span>
                              </>
                            )}
                            {r.createdAt && (
                              <>
                                <span className="text-zinc-700 text-xs">·</span>
                                <span className="text-[11px] text-zinc-600">
                                  {new Date(r.createdAt).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
                          <button
                            onClick={() => handleToggle(r)}
                            className={`rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-all duration-150 ${r.isHidden
                              ? "border-accent/30 bg-accent/10 text-accent hover:bg-accent/20"
                              : "border-[#2a2a2a] bg-[#1a1a1a] text-zinc-300 hover:text-white hover:border-zinc-600 hover:bg-[#222]"
                              }`}
                          >
                            {r.isHidden ? "Unhide" : "Hide"}
                          </button>
                          <button
                            onClick={() => handleDelete(r._id)}
                            className="rounded-lg border border-red-900/40 bg-red-900/10 px-3 py-1.5 text-[11px] font-medium text-red-400 hover:bg-red-900/25 hover:border-red-700/60 transition-all duration-150"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Comment */}
                      {r.comment ? (
                        <p className="mt-2 text-sm text-zinc-400 leading-relaxed line-clamp-3">
                          "{r.comment}"
                        </p>
                      ) : (
                        <p className="mt-2 text-xs text-zinc-700 italic">No comment left</p>
                      )}
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