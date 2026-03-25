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

const listContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const listItem = {
  hidden: { opacity: 0, y: 14, scale: 0.985 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ─── Stock-level meta ─────────────────────────────────────────────────────────
// Colors chosen for max contrast on #171717 (card bg)
function getStockMeta(qty) {
  if (qty === 0) return { label: "Out of stock", color: "#f87171", bg: "rgba(248,113,113,0.10)", pulse: true };
  if (qty <= 5) return { label: "Low stock", color: "#facc15", bg: "rgba(250,204,21,0.10)", pulse: true };
  return { label: "In stock", color: "#4ade80", bg: "rgba(74,222,128,0.10)", pulse: false };
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, iconColor, icon: Icon, index }) {
  return (
    <motion.div
      custom={index}
      variants={slideUp}
      initial="hidden"
      animate="show"
      className="flex-1 min-w-[140px] rounded-2xl p-4 border border-border bg-card flex items-center gap-3"
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

// ─── StockBadge ───────────────────────────────────────────────────────────────
function StockBadge({ qty }) {
  const m = getStockMeta(Number(qty));
  return (
    <span
      style={{ color: m.color, background: m.bg, border: `1px solid ${m.color}30` }}
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-[2px] text-[10px] font-bold uppercase tracking-[0.12em] whitespace-nowrap"
    >
      {m.pulse ? (
        <motion.span
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          style={{ background: m.color }}
          className="h-[5px] w-[5px] rounded-full"
        />
      ) : (
        <span style={{ background: m.color }} className="h-[5px] w-[5px] rounded-full" />
      )}
      {m.label}
    </span>
  );
}

// ─── VariantRow ───────────────────────────────────────────────────────────────
function VariantRow({ productId, variant, stockOverride, onChange, onUpdate }) {
  const current = stockOverride ?? variant.stock;
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState(false);
  const isDirty = stockOverride !== undefined && Number(stockOverride) !== variant.stock;

  const handleUpdate = async () => {
    setSaving(true);
    await onUpdate();
    setFlash(true);
    setTimeout(() => setFlash(false), 700);
    setSaving(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22 }}
      style={{
        background: flash ? "rgba(166,198,85,0.06)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${flash ? "rgba(166,198,85,0.35)" : "rgba(255,255,255,0.04)"}`,
        transition: "background 0.45s ease, border-color 0.45s ease",
      }}
      className="flex flex-wrap items-center gap-3 rounded-xl px-3 py-2.5"
    >
      {/* size + color swatch */}
      <div className="flex items-center gap-2 min-w-[120px]">
        <span className="rounded-md border border-border bg-primary px-2 py-0.5 text-[11px] font-bold text-white uppercase tracking-wider">
          {variant.size}
        </span>
        <div className="flex items-center gap-1.5">
          <span
            style={{ background: variant.color.toLowerCase(), border: "1px solid rgba(255,255,255,0.12)" }}
            className="h-3.5 w-3.5 rounded-full shrink-0"
          />
          <span className="text-xs text-muted capitalize">{variant.color}</span>
        </div>
      </div>

      {/* stock badge */}
      <StockBadge qty={current} />

      {/* controls */}
      <div className="flex items-center gap-2 ml-auto">
        <input
          type="number"
          min="0"
          style={{
            border: `1px solid ${isDirty ? "rgba(166,198,85,0.55)" : "var(--tw-border-opacity, #262626)"}`,
            transition: "border-color 0.2s",
          }}
          className="rounded-lg bg-primary border-border px-3 py-1.5 w-20 text-sm font-semibold text-white text-center focus:outline-none focus:border-accent"
          value={current}
          onChange={(e) => onChange(e.target.value)}
        />

        <motion.button
          whileTap={{ scale: 0.93 }}
          whileHover={{ opacity: 0.85 }}
          onClick={handleUpdate}
          disabled={saving}
          style={{
            background: isDirty ? "#a6c655" : "rgba(166,198,85,0.10)",
            color: isDirty ? "#0f0f0f" : "#a6c655",
            border: isDirty ? "1px solid transparent" : "1px solid rgba(166,198,85,0.25)",
            transition: "all 0.2s ease",
          }}
          className="rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider disabled:opacity-50 whitespace-nowrap min-w-[64px] flex items-center justify-center"
        >
          {saving ? (
            <motion.svg
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.65, ease: "linear" }}
              className="h-3.5 w-3.5"
              fill="none" viewBox="0 0 24 24"
            >
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </motion.svg>
          ) : "Update"}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── ProductCard ──────────────────────────────────────────────────────────────
function ProductCard({ p, stock, setVariantStock, onLoad }) {
  const [open, setOpen] = useState(true);

  const variants = p.variants || [];
  const totalStock = variants.reduce((s, v) => s + v.stock, 0);
  const outCount = variants.filter((v) => v.stock === 0).length;
  const lowCount = variants.filter((v) => v.stock > 0 && v.stock <= 5).length;

  return (
    <motion.div variants={listItem} layout className="rounded-2xl border border-border bg-card overflow-hidden">

      {/* header */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ backgroundColor: "rgba(255,255,255,0.025)" }}
        className="w-full text-left flex items-center gap-3 p-4 transition-colors"
      >
        {/* icon */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "rgba(166,198,85,0.10)", border: "1px solid rgba(166,198,85,0.2)" }}
        >
          <svg className="h-4 w-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{p.name}</p>
          <div className="flex flex-wrap gap-x-2 mt-0.5">
            <span className="text-[10px] text-muted uppercase tracking-wider">
              {variants.length} variant{variants.length !== 1 ? "s" : ""}
            </span>
            {outCount > 0 && (
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#f87171" }}>
                · {outCount} out
              </span>
            )}
            {lowCount > 0 && (
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#facc15" }}>
                · {lowCount} low
              </span>
            )}
          </div>
        </div>

        <span className="text-xs font-extrabold text-accent shrink-0 mr-1">
          {totalStock} units
        </span>

        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22 }}
          className="h-4 w-4 text-muted shrink-0"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </motion.button>

      {/* expandable variants */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="variants"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ overflow: "hidden" }}
          >
            <div className="border-t border-border px-4 pt-3 pb-4 space-y-1.5">
              {variants.map((variant) => {
                const key = `${p._id}-${variant.size}-${variant.color}`;
                return (
                  <VariantRow
                    key={key}
                    productId={p._id}
                    variant={variant}
                    stockOverride={stock[key]}
                    onChange={(val) => setVariantStock(p._id, variant.size, variant.color, val)}
                    onUpdate={() =>
                      api.patch(`/admin/inventory/${p._id}/stock`, {
                        size: variant.size,
                        color: variant.color,
                        stock: Number(stock[key] ?? variant.stock),
                      }).then(onLoad)
                    }
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
          className="rounded-2xl h-[72px] bg-card border border-border"
        />
      ))}
    </div>
  );
}

// ─── Page icons ───────────────────────────────────────────────────────────────
const TotalIcon = ({ color }) => <svg style={{ color }} className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
const LowIcon = ({ color }) => <svg style={{ color }} className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const OutIcon = ({ color }) => <svg style={{ color }} className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>;

// ─── Main export ──────────────────────────────────────────────────────────────
export function AdminInventoryPage() {
  const [data, setData] = useState({ items: [], lowStockCount: 0, outOfStockCount: 0 });
  const [stock, setStock] = useState({});
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/inventory");
      setData(res.data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const setVariantStock = (productId, size, color, value) =>
    setStock((prev) => ({ ...prev, [`${productId}-${size}-${color}`]: value }));

  const filtered = data.items.filter((p) =>
    p.name.toLowerCase().includes(q.toLowerCase())
  );

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
            Inventory Management
          </h1>
        </div>

        <motion.button
          whileTap={{ scale: 0.94 }}
          whileHover={{ opacity: 0.75 }}
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-muted uppercase tracking-wider disabled:opacity-50 transition-opacity"
        >
          <motion.svg
            animate={loading ? { rotate: 360 } : { rotate: 0 }}
            transition={loading ? { repeat: Infinity, duration: 0.8, ease: "linear" } : { duration: 0 }}
            className="h-3.5 w-3.5"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </motion.svg>
          Refresh
        </motion.button>
      </motion.div>

      {/* ── Stat cards ── */}
      <motion.div
        custom={1} variants={slideUp} initial="hidden" animate="show"
        className="flex flex-wrap gap-3"
      >
        <StatCard index={0} label="Total Products" value={data.items.length} iconColor="#a6c655" icon={TotalIcon} />
        <StatCard index={1} label="Low Stock" value={data.lowStockCount} iconColor="#facc15" icon={LowIcon} />
        <StatCard index={2} label="Out of Stock" value={data.outOfStockCount} iconColor="#f87171" icon={OutIcon} />
      </motion.div>

      {/* ── Search ── */}
      <motion.div custom={2} variants={slideUp} initial="hidden" animate="show">
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="w-full rounded-xl bg-card border border-border pl-10 pr-4 py-2.5 text-sm text-white placeholder-muted focus:outline-none focus:border-accent transition-colors duration-200"
            placeholder="Search products…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </motion.div>

      {/* ── List ── */}
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
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: "rgba(166,198,85,0.08)", border: "1px solid rgba(166,198,85,0.18)" }}
            >
              <svg className="h-6 w-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </motion.div>
            <p className="text-sm font-semibold text-white">No products found</p>
            <p className="mt-1 text-xs text-muted">Try a different search term</p>
          </motion.div>

        ) : (
          <motion.div
            key="list"
            variants={listContainer}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {filtered.map((p) => (
              <ProductCard
                key={p._id}
                p={p}
                stock={stock}
                setVariantStock={setVariantStock}
                onLoad={load}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}