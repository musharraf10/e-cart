import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import { HiChevronRight, HiClipboardList, HiCog, HiHeart, HiLocationMarker, HiUser, HiLogout } from "react-icons/hi";

export function AccountPage() {
  const user = useSelector((s) => s.auth.user);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    api.get("/orders/me").then(({ data }) => setOrders(data));
  }, [user, navigate]);

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      className="space-y-4"
    >
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          My Account
        </h1>
        <p className="text-muted text-sm">
          Manage your profile and preferences
        </p>
      </header>

      <section className="bg-[#171717] border border-[#262626] rounded-xl p-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-[#262626] border border-[#303030] flex items-center justify-center overflow-hidden flex-shrink-0">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <span className="text-xl">👤</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white font-semibold truncate">{user.name}</p>
            <p className="text-muted text-sm truncate">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/account/profile")}
            className="h-10 px-4 rounded-xl bg-[#262626] text-white text-sm font-medium active:scale-95 transition-transform"
          >
            Edit Profile
          </button>
        </div>
      </section>

      <section className="space-y-2">
        {[
          { to: "/account/orders", icon: HiClipboardList, label: "Orders" },
          { to: "/account/addresses", icon: HiLocationMarker, label: "Addresses" },
          { to: "/account/wishlist", icon: HiHeart, label: "Wishlist" },
          { to: "/account/settings", icon: HiCog, label: "Settings" },
          { to: "/account/settings", icon: HiLogout, label: "Logout" },
        ].map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center justify-between gap-3 bg-[#171717] border border-[#262626] rounded-xl p-4 active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="h-10 w-10 rounded-xl bg-[#0f0f0f] border border-[#262626] inline-flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-muted" />
              </span>
              <span className="text-white font-medium truncate">{label}</span>
            </div>
            <HiChevronRight className="w-5 h-5 text-muted flex-shrink-0" />
          </Link>
        ))}
      </section>

      <section className="rounded-xl bg-card border border-[#262626] p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="text-base font-semibold text-white">
            Recent orders
          </h2>
          <Link
            to="/account/orders"
            className="text-sm text-accent font-medium active:scale-95 transition-transform"
          >
            View all
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-muted text-sm">
            You have no orders yet.{" "}
            <Link to="/" className="text-accent font-medium hover:underline">
              Discover NoorFit pieces
            </Link>{" "}
            tailored for everyday comfort.
          </p>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 3).map((o) => (
              <Link
                key={o._id}
                to={`/account/orders/${o._id}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-[#262626] px-4 py-3 hover:border-accent/30 transition-colors"
              >
                <div className="text-sm">
                  <p className="font-medium text-white">
                    {o.items.length} item{o.items.length > 1 ? "s" : ""} · $
                    {o.total.toFixed(2)}
                  </p>
                  <p className="text-muted text-xs">
                    {new Date(o.createdAt).toLocaleDateString()} · {o.status}
                  </p>
                </div>
                <HiChevronRight className="w-5 h-5 text-muted flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}
