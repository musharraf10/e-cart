import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { HiSearch, HiShoppingCart, HiUser, HiLogout } from "react-icons/hi";
import { logout } from "../../store/slices/authSlice.js";
import { MobileNavigation } from "./MobileNavigation.jsx";

export function Header() {
  const cartCount = useSelector((s) =>
    s.cart.items.reduce((sum, i) => sum + i.qty, 0)
  );
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQ.trim())}`);
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
          <div className="grid grid-cols-[auto_1fr_auto] items-center h-16 gap-6">
            <Link to="/" className="text-2xl font-bold tracking-tight text-white">
              NoorFit
            </Link>

            <nav className="hidden md:flex items-center justify-center gap-8">
              <NavLink to="/" end className={navLinkClass}>Home</NavLink>
            </nav>

            <div className="hidden md:flex items-center gap-2 justify-self-end">
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

              <NavLink to="/cart" className={({ isActive }) => `relative p-2 rounded-xl transition-colors ${isActive ? "text-[#d4af37]" : "text-white/80 hover:text-[#d4af37]"}`}>
                <HiShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[#d4af37] text-primary text-[10px] font-bold">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </NavLink>

              {user ? (
                <div className="flex items-center gap-2">
                  <NavLink to="/account" className={({ isActive }) => `p-2 rounded-xl transition-colors ${isActive ? "text-[#d4af37]" : "text-white/80 hover:text-[#d4af37]"}`}>
                    <HiUser className="w-5 h-5" />
                  </NavLink>
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
                <NavLink to="/auth" className="ml-1 px-4 py-2 rounded-xl bg-[#d4af37] text-primary text-sm font-semibold hover:opacity-90 transition-opacity">
                  Sign in
                </NavLink>
              )}
            </div>
          </div>
        </div>
      </header>

      <MobileNavigation />
    </>
  );
}
