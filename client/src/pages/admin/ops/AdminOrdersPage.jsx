import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../../api/client.js";

const C = {
  primary: "#0f0f0f",
  card: "#171717",
  muted: "#a1a1aa",
  border: "#262626",
  accent: "#a6c655",
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
};

// Example Output:
// 100000 => ₹1,00,000.00

const STATUS_META = {
  pending: { color: "#facc15", bg: "rgba(250,204,21,0.10)", label: "Pending" },
  confirmed: { color: "#38bdf8", bg: "rgba(56,189,248,0.10)", label: "Confirmed" },
  processing: { color: "#a6c655", bg: "rgba(166,198,85,0.12)", label: "Processing" },
  shipped: { color: "#c084fc", bg: "rgba(192,132,252,0.10)", label: "Shipped" },
  delivered: { color: "#4ade80", bg: "rgba(74,222,128,0.10)", label: "Delivered" },
  cancelled: { color: "#f87171", bg: "rgba(248,113,113,0.10)", label: "Cancelled" },
  refunded: { color: "#fb923c", bg: "rgba(251,146,60,0.10)", label: "Refunded" },
};

const statuses = Object.keys(STATUS_META);

const slideUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.055, duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const listContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.065 } },
};

const listItem = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, x: -16, transition: { duration: 0.18 } },
};

// ─── StatusBadge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const m = STATUS_META[status] ?? STATUS_META.pending;
  return (
    <span
      style={{ color: m.color, background: m.bg, border: `1px solid ${m.color}30` }}
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[10px] font-bold uppercase tracking-[0.14em]"
    >
      <motion.span
        animate={{ opacity: [1, 0.25, 1] }}
        transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
        style={{ background: m.color }}
        className="h-[5px] w-[5px] rounded-full"
      />
      {m.label}
    </span>
  );
}

// ─── Inline status select ─────────────────────────────────────────────────────
function StatusSelect({ value, onChange }) {
  const m = STATUS_META[value] ?? STATUS_META.pending;
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        style={{
          background: C.primary,
          border: `1px solid ${C.border}`,
          color: m.color,
          appearance: "none",
          WebkitAppearance: "none",
          paddingRight: "1.6rem",
        }}
        className="rounded-lg px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider focus:outline-none transition-colors cursor-pointer"
      >
        {statuses.map((s) => (
          <option key={s} value={s} style={{ color: STATUS_META[s].color }}>
            {STATUS_META[s].label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-2.5 w-2.5"
        style={{ color: C.muted }}
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="space-y-2.5">
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.35, 0.65, 0.35] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.13 }}
          style={{ background: C.card, border: `1px solid ${C.border}` }}
          className="rounded-2xl h-[108px]"
        />
      ))}
    </div>
  );
}

function OrderRow({ o, onStatusChange }) {
  const [updating, setUpdating] = useState(false);
  const [flash, setFlash] = useState(false);

  const handleChange = async (e) => {
    setUpdating(true);
    await api.patch(`/admin/orders/${o._id}/status`, { status: e.target.value });
    setFlash(true);
    setTimeout(() => setFlash(false), 700);
    onStatusChange();
    setUpdating(false);
  };

  return (
    <motion.div
      variants={listItem}
      layout
      whileHover={{ y: -2, transition: { duration: 0.18 } }}
      style={{
        background: flash ? `${C.accent}09` : C.card,
        border: `1px solid ${flash ? C.accent + "50" : C.border}`,
        position: "relative",
        overflow: "hidden",
        transition: "background 0.45s ease, border-color 0.45s ease",
      }}
      className="group rounded-2xl p-5"
    >
      {/* accent left strip */}
      <motion.span
        initial={{ scaleY: 0, opacity: 0 }}
        whileHover={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        style={{
          background: C.accent,
          transformOrigin: "top",
          position: "absolute",
          left: 0, top: 10, bottom: 10,
          width: 2,
          borderRadius: 4,
        }}
      />

      {/* Top row */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: [0, -7, 7, 0], transition: { duration: 0.4 } }}
            style={{ background: `${C.accent}12`, border: `1px solid ${C.accent}22` }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          >
            <svg style={{ color: C.accent }} className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </motion.div>

          <div>
            <p className="text-sm font-bold text-white tracking-wide">
              #{o._id.slice(-6).toUpperCase()}
            </p>
            <p className="text-xs mt-0.5" style={{ color: C.muted }}>
              {o.user?.name || "Guest"}
            </p>
          </div>
        </div>

        <StatusBadge status={o.status} />
      </div>

      {/* divider */}
      <div className="my-3.5 h-px" style={{ background: C.border }} />

      {/* Bottom row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-4 text-xs" style={{ color: C.muted }}>
          <span className="flex items-center gap-1.5">
            <svg className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            {o.paymentMethod}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-extrabold" style={{ color: C.accent }}>
            {formatCurrency(o.total)}
          </span>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.14em]" style={{ color: C.muted }}>
              Status
            </span>
            <div style={{ opacity: updating ? 0.5 : 1, pointerEvents: updating ? "none" : "auto" }}
              className="transition-opacity duration-150">
              <StatusSelect value={o.status} onChange={handleChange} />
            </div>

            <AnimatePresence>
              {updating && (
                <motion.svg
                  key="spinner"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1, rotate: 360 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{
                    rotate: { repeat: Infinity, duration: 0.65, ease: "linear" },
                    opacity: { duration: 0.12 },
                    scale: { duration: 0.12 },
                  }}
                  style={{ color: C.accent }}
                  className="h-3.5 w-3.5 shrink-0"
                  fill="none" viewBox="0 0 24 24"
                >
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-80" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </motion.svg>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/orders", { params: { q, status } });
      setOrders(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleKey = (e) => { if (e.key === "Enter") load(); };

  const quickFilters = [
    { key: "", label: "All", color: C.accent, bg: `${C.accent}15` },
    ...statuses.map((s) => ({ key: s, ...STATUS_META[s] })),
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
      style={{ background: C.primary, padding: "1.5rem", minHeight: "100vh" }}
    >
      {/* ── Header ── */}
      <motion.div
        custom={0} variants={slideUp} initial="hidden" animate="show"
        className="flex items-end justify-between"
      >
        <div>
          <p
            style={{ color: C.accent }}
            className="text-[10px] font-bold uppercase tracking-[0.22em] mb-1"
          >
            Admin · NoorFit
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Order Management
          </h1>
        </div>

        <AnimatePresence>
          {orders.length > 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.75 }}
              transition={{ type: "spring", stiffness: 350, damping: 22 }}
              style={{
                background: `${C.accent}12`,
                border: `1px solid ${C.accent}30`,
                color: C.accent,
              }}
              className="rounded-xl px-3 py-1.5 text-xs font-bold"
            >
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Filter bar ── */}
      <motion.div
        custom={1} variants={slideUp} initial="hidden" animate="show"
        style={{ background: C.card, border: `1px solid ${C.border}` }}
        className="rounded-2xl p-4 flex flex-wrap gap-3 items-center"
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <svg
            style={{ color: C.muted }}
            className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            style={{
              background: C.primary,
              border: `1px solid ${C.border}`,
              color: "#fff",
            }}
            className="w-full rounded-xl pl-9 pr-3 py-2 text-sm placeholder-[#52525b] focus:outline-none focus:border-[#a6c655] transition-colors duration-200"
            placeholder="Search order ID or customer…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={handleKey}
          />
        </div>

        {/* Status dropdown */}
        <div className="relative">
          <select
            style={{
              background: C.primary,
              border: `1px solid ${C.border}`,
              color: status ? STATUS_META[status]?.color : "#fff",
              appearance: "none",
              WebkitAppearance: "none",
              paddingRight: "2rem",
            }}
            className="rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#a6c655] transition-colors cursor-pointer"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="" style={{ color: "#fff" }}>All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s} style={{ color: STATUS_META[s].color }}>
                {STATUS_META[s].label}
              </option>
            ))}
          </select>
          <svg
            style={{ color: C.muted }}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Apply */}
        <motion.button
          whileTap={{ scale: 0.94 }}
          whileHover={{ opacity: 0.88 }}
          onClick={load}
          disabled={loading}
          style={{ background: C.accent, color: C.primary }}
          className="rounded-xl px-5 py-2 text-sm font-bold disabled:opacity-50 transition-opacity"
        >
          {loading ? "Loading…" : "Apply"}
        </motion.button>
      </motion.div>

      {/* ── Quick-filter pills ── */}
      <motion.div
        custom={2} variants={slideUp} initial="hidden" animate="show"
        className="flex flex-wrap gap-2"
      >
        {quickFilters.map((item) => {
          const active = status === item.key;
          return (
            <motion.button
              key={item.key}
              whileTap={{ scale: 0.91 }}
              onClick={() => { setStatus(item.key); setTimeout(load, 0); }}
              style={
                active
                  ? { background: item.bg, border: `1px solid ${item.color}50`, color: item.color }
                  : { background: C.card, border: `1px solid ${C.border}`, color: C.muted }
              }
              className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] transition-all duration-200 hover:border-[#3a3a3a]"
            >
              {item.label}
            </motion.button>
          );
        })}
      </motion.div>

      {/* ── Orders list ── */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Skeleton />
          </motion.div>
        ) : orders.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ background: C.card, border: `1px solid ${C.border}` }}
            className="rounded-2xl py-16 text-center"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
              style={{ background: `${C.accent}10`, border: `1px solid ${C.accent}20` }}
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
            >
              <svg style={{ color: C.accent }} className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </motion.div>
            <p className="text-sm font-semibold text-white">No orders found</p>
            <p className="mt-1 text-xs" style={{ color: C.muted }}>Try adjusting your filters</p>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            variants={listContainer}
            initial="hidden"
            animate="show"
            className="space-y-2.5"
          >
            {orders.map((o) => (
              <OrderRow key={o._id} o={o} onStatusChange={load} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}