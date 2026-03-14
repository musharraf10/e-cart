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
    <header className="sticky top-0 z-30 border-b border-borderlux bg-[#111111]/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-semibold tracking-tight">NoorFit</span>
          <span className="hidden lg:inline text-xs text-muted">Crafted for Comfort. Designed for Life.</span>
        </Link>

        <nav className="hidden md:flex items-center gap-4 text-sm">
          <NavLink to="/" className={({ isActive }) => (isActive ? "text-accent font-semibold" : "text-muted hover:text-white")}>Home</NavLink>
          <NavLink to="/" className={({ isActive }) => (isActive ? "text-accent font-semibold" : "text-muted hover:text-white")}>Shop</NavLink>
          <NavLink to="/" className="text-muted hover:text-white">Categories</NavLink>
          <NavLink to="/cart" className={({ isActive }) => (isActive ? "text-accent font-semibold" : "text-muted hover:text-white")}>Cart</NavLink>
          {user ? (
            <>
              <NavLink to="/account" className={({ isActive }) => (isActive ? "text-accent font-semibold" : "text-muted hover:text-white")}>Account</NavLink>
              {user.role === "admin" && (
                <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? "text-accent font-semibold" : "text-muted hover:text-white")}>Admin</NavLink>
              )}
              <button type="button" onClick={handleLogout} className="text-muted hover:text-white">Logout</button>
            </>
          ) : (
            <NavLink to="/auth" className={({ isActive }) => (isActive ? "text-accent font-semibold" : "text-muted hover:text-white")}>Sign in</NavLink>
          )}
        </nav>

        <Link to="/cart" className="md:hidden relative text-sm text-muted">Cart
          {cartCount > 0 && <span className="absolute -top-2 -right-3 text-[10px] bg-accent text-black rounded-full px-1.5 py-0.5">{cartCount}</span>}
        </Link>
      </div>
    </header>
  );
}
