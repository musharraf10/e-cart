import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { HiArrowLeft, HiSearch, HiShoppingCart, HiUser, HiLogout } from "react-icons/hi";
import { logout } from "../../store/slices/authSlice.js";
import api from "../../api/client.js";
import { MobileNavigation } from "./MobileNavigation.jsx";

export function Header() {
  const location = useLocation();
  const cartCount = useSelector((s) =>
    s.cart.items.reduce((sum, i) => sum + i.qty, 0),
  );
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isHome = location.pathname === "/";
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

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-border-subtle/80 bg-bg-primary/95 backdrop-blur-sm">
        <div className="w-full px-4">
          <div className="grid grid-cols-[auto_1fr_auto] items-center h-14 gap-2">
            <div className="flex items-center">
              {isHome ? (
                <Link to="/" className="inline-flex items-center" aria-label="Go to home">
                  <img src="/icons/icon-192.png" alt="NoorFit" className="h-7 w-7 rounded-lg" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
                  className="p-2 -ml-2 rounded-xl text-text-primary active:scale-[0.98] transition-transform duration-200"
                  aria-label="Back"
                >
                  <HiArrowLeft className="w-5 h-5" />
                </button>
              )}
            </div>

            {!isAdminRoute && (
              <button
                type="button"
                onClick={() => navigate("/search")}
                className="h-10 w-full rounded-xl border border-border-subtle bg-bg-secondary px-3 flex items-center gap-2 text-left"
                aria-label="Open search"
              >
                <HiSearch className="w-4 h-4 text-text-muted" />
                <span className="text-xs text-text-muted">Search products</span>
              </button>
            )}

            <div className="flex items-center gap-1 justify-self-end">
              {!isAdminRoute && (
                <>
                  <NavLink
                    to="/cart"
                    className="relative p-2 rounded-xl text-text-primary/80 transition-colors duration-200 hover:text-text-primary"
                    aria-label="Cart"
                  >
                    <HiShoppingCart className="w-5 h-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-text-primary text-bg-primary text-[9px] font-semibold">
                        {cartCount > 99 ? "99+" : cartCount}
                      </span>
                    )}
                  </NavLink>

                  <NavLink
                    to={user ? "/account" : "/auth"}
                    className="p-2 rounded-xl text-text-primary/80 transition-colors duration-200 hover:text-text-primary"
                    aria-label="Account"
                  >
                    <HiUser className="w-5 h-5" />
                  </NavLink>
                </>
              )}

              {isAdminRoute && user?.role === "admin" && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 rounded-xl border border-border-subtle text-text-primary"
                  aria-label="Logout"
                >
                  <HiLogout className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {!isAdminRoute && <MobileNavigation />}
    </>
  );
}
