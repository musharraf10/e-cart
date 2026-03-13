import { Link, NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice.js";

export function Header() {
  const cartCount = useSelector((s) => s.cart.items.reduce((sum, i) => sum + i.qty, 0));
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-semibold tracking-tight">NoorFit</span>
          <span className="hidden sm:inline text-xs text-gray-500">
            Crafted for Comfort. Designed for Life.
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-sm ${isActive ? "text-accent font-semibold" : "text-gray-600"}`
            }
          >
            Shop
          </NavLink>
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `text-sm relative ${isActive ? "text-accent font-semibold" : "text-gray-600"
              }`
            }
          >
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 text-[10px] bg-accent text-white rounded-full px-1.5 py-0.5">
                {cartCount}
              </span>
            )}
          </NavLink>
          {user ? (
            <>
              <NavLink
                to="/account"
                className={({ isActive }) =>
                  `text-sm ${isActive ? "text-accent font-semibold" : "text-gray-600"}`
                }
              >
                Account
              </NavLink>
              {user.role === "admin" && (
                <>
                  <NavLink
                    to="/admin/dashboard"
                    className={({ isActive }) =>
                      `text-sm ${isActive ? "text-accent font-semibold" : "text-gray-600"
                      }`
                    }
                  >
                    Admin
                  </NavLink>
                </>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-accent"
              >
                Logout
              </button>
            </>
          ) : (
            <NavLink
              to="/auth"
              className={({ isActive }) =>
                `text-sm ${isActive ? "text-accent font-semibold" : "text-gray-600"}`
              }
            >
              Sign in
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}

