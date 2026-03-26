import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HiHome,
  HiSearch,
  HiShoppingCart,
  HiHeart,
} from "react-icons/hi";
import { Link } from "react-router-dom";

const navItems = [
  { to: "/", icon: HiHome, label: "Home" },
  { to: "/search", icon: HiSearch, label: "Search" },
  { to: "/account/wishlist", icon: HiHeart, label: "Wishlist" },
  { to: "/cart", icon: HiShoppingCart, label: "Cart" },
];

export function MobileNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((s) => s.auth.user);
  const cartCount = useSelector((s) =>
    s.cart.items.reduce((sum, i) => sum + i.qty, 0)
  );

  const isActive = (to) => {
    if (to === "/cart") return location.pathname === "/cart";
    if (to === "/search") return location.pathname === "/search";
    if (to === "/account/wishlist") return location.pathname.startsWith("/account/wishlist");
    if (to === "/") return location.pathname === "/";
    return false;
  };

  const handleNavClick = (to) => {
    if (to === "/account/wishlist" && !user) {
      navigate("/auth");
      return;
    }

    navigate(to);
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-[#262626] safe-area-pb"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-center gap-4 border-b border-[#262626] px-3 py-2">
        <Link to="/about" className="text-[11px] font-medium text-muted hover:text-white">
          About
        </Link>
        <Link to="/support" className="text-[11px] font-medium text-muted hover:text-white">
          Support
        </Link>
        <Link to="/terms" className="text-[11px] font-medium text-muted hover:text-white">
          Terms
        </Link>
      </div>
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = isActive(to);
          const isCart = to === "/cart";

          return (
            <button
              key={to + label}
              type="button"
              onClick={() => handleNavClick(to)}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-2 rounded-xl transition-all duration-200 ${
                active
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:text-white"
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
            </button>
          );
        })}
      </div>
    </nav>
  );
}
