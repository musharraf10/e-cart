import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../../api/client.js";

// ─── Motion presets ───────────────────────────────────────────────────────────
const slideUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.055, duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
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

const listContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.065 } },
};

const listItem = {
  hidden: { opacity: 0, y: 14, scale: 0.985 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, x: -20, scale: 0.97, transition: { duration: 0.2 } },
};

// ─── Avatar initials ──────────────────────────────────────────────────────────
function Avatar({ name, isBlocked }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      style={{
        background: isBlocked ? "rgba(248,113,113,0.10)" : "rgba(166,198,85,0.10)",
        border: `1px solid ${isBlocked ? "rgba(248,113,113,0.25)" : "rgba(166,198,85,0.22)"}`,
        color: isBlocked ? "#f87171" : "#a6c655",
      }}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold tracking-wider select-none"
    >
      {initials}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, iconColor, icon: Icon, index }) {
  return (
    <motion.div
      custom={index}
      variants={slideUp}
      initial="hidden"
      animate="show"
      className="flex-1 min-w-[130px] rounded-2xl p-4 border border-border bg-card flex items-center gap-3"
    >
      <div
        style={{ background: `${iconColor}12`, border: `1px solid ${iconColor}25` }}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
      >
        <Icon color={iconColor} />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-white leading-none">{value}</p>
        <p className="text-[11px] text-muted mt-0.5 uppercase tracking-[0.12em] font-medium">{label}</p>
      </div>
    </motion.div>
  );
}

// ─── Confirm popover ──────────────────────────────────────────────────────────
function ConfirmDelete({ onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -4 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 z-20 rounded-xl border border-border bg-card shadow-2xl p-4 w-56"
    >
      <p className="text-xs font-semibold text-white mb-1">Delete customer?</p>
      <p className="text-[11px] text-muted mb-3 leading-relaxed">
        This action is permanent and cannot be undone.
      </p>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 rounded-lg border border-border py-1.5 text-[11px] font-bold text-muted uppercase tracking-wider hover:bg-white/5 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 rounded-lg py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors"
          style={{ background: "rgba(248,113,113,0.15)", color: "#f87171", border: "1px solid rgba(248,113,113,0.3)" }}
        >
          Delete
        </button>
      </div>
    </motion.div>
  );
}

// ─── Customer card ────────────────────────────────────────────────────────────
function CustomerCard({ c, onReload }) {
  const [blocking, setBlocking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const handleBlock = async () => {
    setBlocking(true);
    await api.patch(`/admin/customers/${c._id}/block`);
    onReload();
    setBlocking(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    setConfirmDel(false);
    await api.delete(`/admin/customers/${c._id}`);
    onReload();
    setDeleting(false);
  };

  return (
    <motion.div
      variants={listItem}
      layout
      whileHover={{ y: -2, transition: { duration: 0.18 } }}
      style={{
        background: c.isBlocked ? "rgba(248,113,113,0.03)" : "var(--tw-bg-opacity, #171717)",
        border: `1px solid ${c.isBlocked ? "rgba(248,113,113,0.18)" : "var(--tw-border-opacity, #262626)"}`,
        position: "relative",
        overflow: "visible",
      }}
      className="group rounded-2xl bg-card border-border p-4 transition-colors"
    >
      {/* accent strip */}
      <motion.span
        initial={{ scaleY: 0, opacity: 0 }}
        whileHover={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        style={{
          background: c.isBlocked ? "#f87171" : "#a6c655",
          transformOrigin: "top",
          position: "absolute",
          left: 0, top: 10, bottom: 10,
          width: 2, borderRadius: 4,
        }}
      />

      <div className="flex flex-wrap items-start justify-between gap-3">
        {/* left: avatar + info */}
        <div className="flex items-start gap-3 min-w-0">
          <Avatar name={c.name} isBlocked={c.isBlocked} />

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-white">{c.name}</p>
              {c.isBlocked && (
                <span
                  style={{ color: "#f87171", background: "rgba(248,113,113,0.10)", border: "1px solid rgba(248,113,113,0.25)" }}
                  className="rounded-full px-2 py-[2px] text-[10px] font-bold uppercase tracking-[0.12em]"
                >
                  Blocked
                </span>
              )}
            </div>
            <p className="text-xs text-muted mt-0.5 truncate">{c.email}</p>
            <p className="text-xs text-muted mt-0.5">{c.mobileNumber || "No phone"}</p>
          </div>
        </div>

        {/* right: stats */}
        <div className="flex items-center gap-4 text-right shrink-0">
          <div>
            <p className="text-base font-extrabold text-accent leading-none">
              {(formatCurrency(c.totalSpent) || 0)}
            </p>
            <p className="text-[10px] text-muted mt-0.5 uppercase tracking-wider">Spent</p>
          </div>
          <div
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #262626" }}
            className="h-8 w-px rounded-full"
          />
          <div>
            <p className="text-base font-extrabold text-white leading-none">{c.totalOrders}</p>
            <p className="text-[10px] text-muted mt-0.5 uppercase tracking-wider">Orders</p>
          </div>
        </div>
      </div>

      {/* divider */}
      <div className="my-3.5 h-px bg-border" />

      {/* actions */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] text-muted uppercase tracking-wider">
          ID: {c._id.slice(-8).toUpperCase()}
        </p>

        <div className="flex items-center gap-2 relative">
          {/* block / unblock */}
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={handleBlock}
            disabled={blocking}
            style={
              c.isBlocked
                ? { background: "rgba(166,198,85,0.10)", color: "#a6c655", border: "1px solid rgba(166,198,85,0.3)" }
                : { background: "rgba(248,113,113,0.08)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" }
            }
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider disabled:opacity-50 transition-all"
          >
            {blocking ? (
              <motion.svg animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.65, ease: "linear" }}
                className="h-3 w-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </motion.svg>
            ) : (
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {c.isBlocked
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                }
              </svg>
            )}
            {c.isBlocked ? "Unblock" : "Block"}
          </motion.button>

          {/* delete */}
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => setConfirmDel((v) => !v)}
            disabled={deleting}
            style={{ background: "rgba(248,113,113,0.08)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider disabled:opacity-50 transition-all hover:bg-[rgba(248,113,113,0.15)]"
          >
            {deleting ? (
              <motion.svg animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.65, ease: "linear" }}
                className="h-3 w-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </motion.svg>
            ) : (
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
            Delete
          </motion.button>

          {/* confirm popover */}
          <AnimatePresence>
            {confirmDel && (
              <ConfirmDelete
                onConfirm={handleDelete}
                onCancel={() => setConfirmDel(false)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.35, 0.65, 0.35] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.14 }}
          className="rounded-2xl h-[140px] bg-card border border-border"
        />
      ))}
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const PeopleIcon = ({ color }) => <svg style={{ color }} className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const BlockedIcon = ({ color }) => <svg style={{ color }} className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>;
const RevenueIcon = ({ color }) => <svg style={{ color }} className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

// ─── Main page ────────────────────────────────────────────────────────────────
export function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all"); // all | active | blocked

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/customers");
      setCustomers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const totalRevenue = customers.reduce((s, c) => s + (c.totalSpent || 0), 0);
  const blockedCount = customers.filter((c) => c.isBlocked).length;

  const filtered = customers.filter((c) => {
    const matchQ = c.name.toLowerCase().includes(q.toLowerCase()) ||
      c.email.toLowerCase().includes(q.toLowerCase());
    const matchF = filter === "all"
      ? true
      : filter === "blocked" ? c.isBlocked : !c.isBlocked;
    return matchQ && matchF;
  });

  const pillFilters = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "blocked", label: "Blocked" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 min-h-screen bg-primary p-6"
    >
      {/* ── Header ── */}
      <motion.div
        custom={0} variants={slideUp} initial="hidden" animate="show"
        className="flex items-end justify-between"
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent mb-1">
            Admin · NoorFit
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Customer Management
          </h1>
        </div>

        <AnimatePresence>
          {customers.length > 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.75 }}
              transition={{ type: "spring", stiffness: 350, damping: 22 }}
              style={{ background: "rgba(166,198,85,0.10)", border: "1px solid rgba(166,198,85,0.28)", color: "#a6c655" }}
              className="rounded-xl px-3 py-1.5 text-xs font-bold"
            >
              {customers.length} customer{customers.length !== 1 ? "s" : ""}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Stat cards ── */}
      <motion.div
        custom={1} variants={slideUp} initial="hidden" animate="show"
        className="flex flex-wrap gap-3"
      >
        <StatCard index={0} label="Total Customers" value={customers.length} iconColor="#a6c655" icon={PeopleIcon} />
        <StatCard index={1} label="Blocked" value={blockedCount} iconColor="#f87171" icon={BlockedIcon} />
        <StatCard index={2} label="Total Revenue" value={`${formatCurrency(totalRevenue)}`} iconColor="#facc15" icon={RevenueIcon} />
      </motion.div>

      {/* ── Search + filter bar ── */}
      <motion.div
        custom={2} variants={slideUp} initial="hidden" animate="show"
        className="flex flex-wrap gap-3 items-center"
      >
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="w-full rounded-xl bg-card border border-border pl-10 pr-4 py-2.5 text-sm text-white placeholder-muted focus:outline-none focus:border-accent transition-colors duration-200"
            placeholder="Search by name or email…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {/* segment pills */}
        <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card p-1">
          {pillFilters.map(({ key, label }) => {
            const active = filter === key;
            return (
              <motion.button
                key={key}
                whileTap={{ scale: 0.93 }}
                onClick={() => setFilter(key)}
                style={
                  active
                    ? { background: "#a6c655", color: "#0f0f0f" }
                    : { background: "transparent", color: "#a1a1aa" }
                }
                className="rounded-lg px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-all duration-200"
              >
                {label}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* ── Customer list ── */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="skel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Skeleton />
          </motion.div>

        ) : filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-border bg-card py-16 text-center"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
              style={{ background: "rgba(166,198,85,0.08)", border: "1px solid rgba(166,198,85,0.18)" }}
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
            >
              <svg className="h-6 w-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </motion.div>
            <p className="text-sm font-semibold text-white">No customers found</p>
            <p className="mt-1 text-xs text-muted">Try adjusting your search or filter</p>
          </motion.div>

        ) : (
          <motion.div
            key="list"
            variants={listContainer}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            <AnimatePresence>
              {filtered.map((c) => (
                <CustomerCard key={c._id} c={c} onReload={load} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}