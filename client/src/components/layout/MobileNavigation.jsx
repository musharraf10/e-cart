import { useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiHome,
  HiSearch,
  HiShoppingCart,
  HiUser,
  HiCog,
  HiClipboardList,
  HiLocationMarker,
  HiHeart,
  HiLogout,
} from "react-icons/hi";
import { logout } from "../../store/slices/authSlice.js";

const navItems = [
  { to: "/", icon: HiHome, label: "Home" },
  { to: "/#categories", icon: HiHome, label: "Categories" },
  { to: "/", icon: HiSearch, label: "Search", search: true },
  { to: "/cart", icon: HiShoppingCart, label: "Cart" },
  { to: "/account", icon: HiUser, label: "Account", account: true },
];

const accountLinks = [
  { to: "/account/profile", icon: HiUser, label: "Profile" },
  { to: "/account/orders", icon: HiClipboardList, label: "Orders" },
  { to: "/account/addresses", icon: HiLocationMarker, label: "Addresses" },
  { to: "/account/wishlist", icon: HiHeart, label: "Wishlist" },
  { to: "/account/settings", icon: HiCog, label: "Settings" },
];

export function MobileNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [accountOpen, setAccountOpen] = useState(false);
  const cartCount = useSelector((s) =>
    s.cart.items.reduce((sum, i) => sum + i.qty, 0)
  );
  const user = useSelector((s) => s.auth.user);

  const isActive = (to) => {
    if (to === "/cart") return location.pathname === "/cart";
    if (to === "/account" || to.startsWith?.("/account"))
      return location.pathname.startsWith("/account");
    if (to === "/") return location.pathname === "/";
    return false;
  };

  const handleAccountClick = (e) => {
    if (user) {
      e.preventDefault();
      setAccountOpen(true);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setAccountOpen(false);
    navigate("/");
  };

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-[#262626] safe-area-pb"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map(({ to, icon: Icon, label, search, account }) => {
            const active = isActive(to);
            const isCart = to === "/cart";
            if (account) {
              return (
                <button
                  key={to + label}
                  type="button"
                  onClick={handleAccountClick}
                  className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-2 rounded-xl transition-all duration-200 ${
                    active ? "text-accent" : "text-muted hover:text-white"
                  }`}
                  aria-expanded={accountOpen}
                  aria-haspopup="true"
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-[10px] font-medium">{label}</span>
                </button>
              );
            }
            return (
              <NavLink
                key={to + label}
                to={search ? "/" : to.replace("/#categories", "/") }
                className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-2 rounded-xl transition-all duration-200 ${
                  active ? "text-accent" : "text-muted hover:text-white"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <span className="relative inline-flex">
                  <Icon className="w-6 h-6" />
                  {isCart && cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-accent text-primary text-[10px] font-bold">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </span>
                <span className="text-[10px] font-medium">{label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      <AnimatePresence>
        {accountOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-primary/80 backdrop-blur-sm md:hidden"
              onClick={() => setAccountOpen(false)}
              aria-hidden
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed bottom-0 left-0 right-0 z-50 md:hidden rounded-t-2xl bg-card border border-[#262626] border-b-0 shadow-xl safe-area-pb"
            >
              <div className="flex items-center justify-between p-4 border-b border-[#262626]">
                <h2 className="text-lg font-semibold text-white">Account</h2>
                <button
                  type="button"
                  onClick={() => setAccountOpen(false)}
                  className="p-2 text-muted hover:text-white rounded-lg"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 pb-8 max-h-[70vh] overflow-auto">
                {user ? (
                  <div className="space-y-1">
                    {accountLinks.map(({ to, icon: Icon, label }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-white hover:bg-[#262626] transition-colors"
                      >
                        <Icon className="w-5 h-5 text-muted" />
                        {label}
                      </Link>
                    ))}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-red-400 hover:bg-red-900/20 transition-colors"
                    >
                      <HiLogout className="w-5 h-5" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-muted text-sm">Sign in to access your account.</p>
                    <Link
                      to="/auth"
                      onClick={() => setAccountOpen(false)}
                      className="block rounded-xl bg-accent text-primary py-3 text-center text-sm font-semibold"
                    >
                      Sign in
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
