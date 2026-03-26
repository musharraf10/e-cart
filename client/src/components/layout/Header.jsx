import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { HiArrowLeft, HiSearch, HiShoppingCart, HiUser, HiLogout } from "react-icons/hi";
import { logout } from "../../store/slices/authSlice.js";
import api from "../../api/client.js";
import { MobileNavigation } from "./MobileNavigation.jsx";
import { NotificationBell } from "./NotificationBell.jsx";

export function Header() {
  const location = useLocation();
  const cartCount = useSelector((s) =>
    s.cart.items.reduce((sum, i) => sum + i.qty, 0)
  );
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");

  const isHome = location.pathname === "/";
  const isSearchPage = location.pathname === "/search";
  const isAdminRoute = location.pathname.startsWith("/admin");

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // best effort
    }
    dispatch(logout());
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchOpen(false);
      setSearchQ("");
    }
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-200 py-2 ${isActive ? "text-[#d4af37]" : "text-white/80 hover:text-[#d4af37]"
    }`;

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-[#262626] bg-[#0f0f0f]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-[auto_1fr_auto] items-center h-16 gap-3">
            <div className="flex items-center gap-2">
              {isHome ? (
                <Link to="/" className="text-xl font-bold tracking-tight text-white">
                  NoorFit
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
                  className="p-2 -ml-2 rounded-xl text-white/90 active:scale-[0.98] transition-transform"
                  aria-label="Back"
                >
                  <HiArrowLeft className="w-6 h-6" />
                </button>
              )}
            </div>

            {!isAdminRoute && (
              <button
                type="button"
                onClick={() => navigate("/search")}
                className={`h-11 w-full rounded-xl border border-[#262626] bg-card px-3 flex items-center gap-2 text-left ${isSearchPage ? "opacity-0 pointer-events-none" : "opacity-100"
                  }`}
                aria-label="Open search"
              >
                <HiSearch className="w-5 h-5 text-muted" />
                <span className="text-sm text-muted">Search NoorFit</span>
              </button>
            )}

            <nav className="hidden md:flex items-center justify-center gap-8">
              <NavLink to="/" end className={navLinkClass}>Home</NavLink>
            </nav>

            <div className="flex items-center gap-2 justify-self-end">
              {/* {!isAdminRoute && (
                <NavLink
                  to="/cart"
                  className={({ isActive }) =>
                    `relative p-2 rounded-xl transition-colors ${isActive ? "text-accent" : "text-white/80 hover:text-accent"
                    }`
                  }
                  aria-label="Cart"
                >
                  <HiShoppingCart className="w-6 h-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-accent text-primary text-[10px] font-bold">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </NavLink>

              )} */}

              {!isAdminRoute && (
                <>
                  {user ? (
                    <>
                      <NotificationBell />
                      <NavLink
                      to="/account"
                      className={({ isActive }) =>
                        `p-2 rounded-xl transition-colors ${isActive ? "text-accent" : "text-white/80 hover:text-accent"
                        }`
                      }
                      aria-label="Account"
                    >
                      <HiUser className="w-6 h-6" />
                    </NavLink>
                    </>
                  ) : (
                    <NavLink
                      to="/auth"
                      className="h-11 px-4 rounded-xl bg-accent text-black text-sm font-semibold inline-flex items-center active:scale-95 transition-transform"
                    >
                      Login
                    </NavLink>
                  )}
                </>
              )}

              {isAdminRoute && user?.role === "admin" && (
                <div className="flex items-center gap-3">
                  <span className="hidden md:inline text-sm text-muted">
                    Admin
                  </span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="h-9 px-4 rounded-xl border border-[#262626] text-sm text-white hover:bg-[#262626] active:scale-95 transition-transform"
                  >
                    Logout
                  </button>
                </div>
              )}

              <div className="hidden md:flex items-center gap-2">
                <AnimatePresence>
                  {searchOpen ? (
                    <motion.form
                      key="search-form"
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 220, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      onSubmit={handleSearchSubmit}
                      className="overflow-hidden"
                    >
                      <input
                        type="search"
                        placeholder="Search…"
                        value={searchQ}
                        onChange={(e) => setSearchQ(e.target.value)}
                        onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
                        autoFocus
                        className="w-full rounded-full bg-card border border-[#262626] px-4 py-2 text-sm text-white placeholder-muted focus:outline-none focus:border-[#d4af37]"
                      />
                    </motion.form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSearchOpen(true)}
                      className="p-2 rounded-xl text-white/80 hover:text-[#d4af37] transition-colors"
                      aria-label="Search"
                    >
                      <HiSearch className="w-5 h-5" />
                    </button>
                  )}
                </AnimatePresence>

                {user && !isAdminRoute ? (
                  <div className="flex items-center gap-2">
                    {user.role === "admin" && (
                      <NavLink
                        to="/admin/dashboard"
                        className={navLinkClass}
                      >
                        Admin
                      </NavLink>
                    )}
                    <button type="button" onClick={handleLogout} className="p-2 rounded-xl text-white/80 hover:text-[#d4af37] transition-colors" aria-label="Logout">
                      <HiLogout className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div />
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {!isAdminRoute && <MobileNavigation />}
    </>
  );
}