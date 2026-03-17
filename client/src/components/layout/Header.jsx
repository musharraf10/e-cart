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
    `text-sm font-medium transition-colors duration-200 py-2 ${
      isActive ? "text-accent" : "text-muted hover:text-white"
    }`;

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-[#262626] bg-primary/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-18 gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 flex-shrink-0 focus-ring rounded-lg"
            >
              <span className="text-xl md:text-2xl font-bold tracking-tight text-white">
                NoorFit
              </span>
              <span className="hidden lg:inline text-xs text-muted">
                Crafted for Comfort. Designed for Life.
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              <NavLink to="/" end className={navLinkClass}>
                Home
              </NavLink>
              <NavLink to="/shop" className={navLinkClass}>
                Shop
              </NavLink>
              <a href="/#categories" className={navLinkClass}>
                Categories
              </a>
            </nav>

            <div className="hidden md:flex items-center gap-2">
              <AnimatePresence>
                {searchOpen ? (
                  <motion.form
                    key="search-form"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
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
                      className="w-full rounded-full bg-card border border-[#262626] px-4 py-2 text-sm text-white placeholder-muted focus:outline-none focus:border-accent transition-colors"
                    />
                  </motion.form>
                ) : (
                  <motion.button
                    key="search-btn"
                    type="button"
                    onClick={() => setSearchOpen(true)}
                    className="p-2 rounded-xl text-muted hover:text-white hover:bg-card transition-all duration-200"
                    aria-label="Search"
                  >
                    <HiSearch className="w-5 h-5" />
                  </motion.button>
                )}
              </AnimatePresence>

              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  `relative p-2 rounded-xl transition-all duration-200 ${navLinkClass({ isActive })}`
                }
              >
                <HiShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-accent text-primary text-[10px] font-bold">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </NavLink>

              {user ? (
                <div className="hidden md:flex items-center gap-1">
                  <NavLink
                    to="/account"
                    className={({ isActive }) =>
                      `p-2 rounded-xl ${navLinkClass({ isActive })}`
                    }
                  >
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
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="p-2 rounded-xl text-muted hover:text-white transition-colors"
                    aria-label="Logout"
                  >
                    <HiLogout className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <NavLink
                  to="/auth"
                  className="ml-1 px-4 py-2 rounded-xl bg-accent text-primary text-sm font-semibold hover:opacity-90 transition-opacity"
                >
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
