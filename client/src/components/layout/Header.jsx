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
    <header className="border-b border-[#262626] bg-[#0f0f0f]/95 backdrop-blur sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-white">NoorFit</span>
          <span className="hidden sm:inline text-xs text-[#a1a1aa]">
            Crafted for Comfort. Designed for Life.
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${
                isActive ? "text-[#ff6b00]" : "text-[#a1a1aa] hover:text-white"
              }`
            }
          >
            Shop
          </NavLink>
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `text-sm font-medium relative transition-colors ${
                isActive ? "text-[#ff6b00]" : "text-[#a1a1aa] hover:text-white"
              }`
            }
          >
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-3 -right-4 text-[10px] bg-[#ff6b00] text-white rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg shadow-[#ff6b00]/30">
                {cartCount}
              </span>
            )}
          </NavLink>
          {user ? (
            <>
              <NavLink
                to="/account"
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive ? "text-[#ff6b00]" : "text-[#a1a1aa] hover:text-white"
                  }`
                }
              >
                Account
              </NavLink>
              {user.role === "admin" && (
                <>
                  <NavLink
                    to="/admin/dashboard"
                    className={({ isActive }) =>
                      `text-sm font-medium transition-colors ${
                        isActive ? "text-[#ff6b00]" : "text-[#a1a1aa] hover:text-white"
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
                className="text-sm font-medium text-[#a1a1aa] hover:text-white transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <NavLink
              to="/auth"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? "text-[#ff6b00]" : "text-[#a1a1aa] hover:text-white"
                }`
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

