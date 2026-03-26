import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  HiChevronRight,
  HiClipboardList,
  HiCog,
  HiHeart,
  HiLocationMarker,
  HiLogout,
} from "react-icons/hi";
import api from "../api/client.js";

/* ── helpers ────────────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1], delay },
});

function getInitials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const STATUS_COLOR = {
  delivered: "#a6c655",
  processing: "#facc15",
  shipped: "#60a5fa",
  cancelled: "#f87171",
};

function StatusBadge({ status = "processing" }) {
  const color = STATUS_COLOR[status.toLowerCase()] ?? "#a1a1aa";
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
      style={{ background: `${color}15`, color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: color }}
      />
      {status}
    </span>
  );
}

/* ── nav items ──────────────────────────────────────────────── */
const NAV_ITEMS = [
  { to: "/account/orders", icon: HiClipboardList, label: "Orders" },
  { to: "/account/addresses", icon: HiLocationMarker, label: "Addresses" },
  { to: "/account/wishlist", icon: HiHeart, label: "Wishlist" },
  { to: "/account/settings", icon: HiCog, label: "Settings" },
];

/* ── component ──────────────────────────────────────────────── */
export function AccountPage() {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    api
      .get("/orders/me")
      .then(({ data }) => setOrders(data))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen w-full bg-primary overflow-x-hidden">
      <div className="w-full max-w-[440px] mx-auto px-3 py-6 space-y-4">

        {/* ── Profile card ──────────────────────────── */}
        <motion.div
          {...fadeUp(0)}
          className="bg-card border border-border rounded-xl p-4 flex items-center gap-4"
        >
          {/* avatar */}
          <div className="h-14 w-14 rounded-xl bg-primary border border-border flex items-center justify-center flex-shrink-0 overflow-hidden">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <span className="text-accent text-lg font-bold">
                {getInitials(user.name)}
              </span>
            )}
          </div>

          {/* name / email */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold truncate">{user.name}</p>
            <p className="text-muted text-sm truncate">{user.email}</p>
          </div>

          {/* edit */}
          <button
            type="button"
            onClick={() => navigate("/account/profile")}
            className="text-sm font-medium text-accent px-3 py-1.5 rounded-lg bg-primary border border-border active:scale-95 transition-transform flex-shrink-0"
          >
            Edit
          </button>
        </motion.div>

        {/* ── Nav menu ──────────────────────────────── */}
        <motion.div
          {...fadeUp(0.05)}
          className="bg-card border border-border rounded-xl"
        >
          {NAV_ITEMS.map(({ to, icon: Icon, label }, i) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 px-4 py-3.5 active:bg-primary transition-colors"
              style={{
                borderBottom: i < NAV_ITEMS.length - 1 ? "1px solid #262626" : "none",
              }}
            >
              <span className="h-9 w-9 rounded-xl bg-primary border border-border flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-muted" />
              </span>
              <span className="flex-1 text-sm font-medium text-white">{label}</span>
              <HiChevronRight className="w-4 h-4 text-border flex-shrink-0" />
            </Link>
          ))}
        </motion.div>

        {/* ── Recent orders ─────────────────────────── */}
        <motion.div
          {...fadeUp(0.1)}
          className="bg-card border border-border rounded-xl overflow-hidden"
        >
          <div className="flex items-center  w-full min-w-0 justify-between px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-white">Recent Orders</h2>
            {orders.length > 0 && (
              <Link
                to="/account/orders"
                className="text-xs font-semibold text-accent active:opacity-60 transition-opacity"
              >
                View all
              </Link>
            )}
          </div>

          {loading ? (
            /* skeleton */
            <div className="space-y-px">
              {[1, 2].map((n) => (
                <div key={n} className="flex items-center gap-3 px-4 py-3.5">
                  <div className="h-9 w-9 rounded-xl bg-primary animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-32 bg-primary rounded animate-pulse" />
                    <div className="h-2.5 w-20 bg-primary rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="py-10 flex flex-col items-center gap-2 text-center px-4">
              <p className="text-muted text-sm">No orders yet.</p>
              <Link
                to="/"
                className="text-xs font-semibold text-accent active:opacity-60 transition-opacity"
              >
                Discover NoorFit →
              </Link>
            </div>
          ) : (
            orders.slice(0, 3).map((o, i) => (
              <Link
                key={o._id}
                to={`/account/orders/${o._id}`}
                className="flex items-center gap-3 px-4 py-3.5 active:bg-primary transition-colors"
                style={{
                  borderBottom:
                    i < Math.min(orders.length, 3) - 1 ? "1px solid #262626" : "none",
                }}
              >
                <span className="h-9 w-9 rounded-xl bg-primary border border-border flex items-center justify-center flex-shrink-0 text-base">
                  📦
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">
                    {o.items.length} item{o.items.length !== 1 ? "s" : ""}
                    <span className="text-muted font-normal"> · </span>
                    <span className="text-accent">${o.total.toFixed(2)}</span>
                  </p>
                  <p className="text-muted text-xs mt-0.5">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <StatusBadge status={o.status} />
              </Link>
            ))
          )}
        </motion.div>

        {/* ── Sign out ──────────────────────────────── */}
        <motion.div {...fadeUp(0.15)}>
          <button
            type="button"
            onClick={() => dispatch({ type: "auth/logout" })}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold active:scale-[.98] transition-transform"
            style={{
              background: "rgba(248,113,113,.06)",
              border: "1px solid rgba(248,113,113,.18)",
              color: "#f87171",
            }}
          >
            <HiLogout className="w-4 h-4" />
            Sign Out
          </button>
        </motion.div>

      </div>
    </div>
  );
}