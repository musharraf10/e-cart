import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  FiActivity,
  FiBox,
  FiClipboard,
  FiGrid,
  FiLogOut,
  FiMessageCircle,
  FiPackage,
  FiRepeat,
  FiSettings,
  FiShoppingCart,
  FiTag,
  FiTruck,
  FiUsers,
} from "react-icons/fi";
import api from "../../api/client.js";
import { logout } from "../../store/slices/authSlice.js";

const links = [
  ["/admin/dashboard", "Dashboard", FiGrid],
  ["/admin/products", "Products", FiBox],
  ["/admin/orders", "Orders", FiShoppingCart],
  ["/admin/inventory", "Inventory", FiPackage],
  ["/admin/customers", "Customers", FiUsers],
  ["/admin/coupons", "Coupons", FiTag],
  ["/admin/announcements", "Announcements", FiClipboard],
  ["/admin/reviews", "Reviews", FiMessageCircle],
  ["/admin/drops", "Drops", FiTruck],
  ["/admin/returns", "Returns", FiRepeat],
  ["/admin/analytics", "Analytics", FiActivity],
  ["/admin/settings", "Settings", FiSettings],
];

export function AdminSidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
    <div className="flex h-full w-full flex-col bg-primary p-4">
      <div className="mb-4 border-b border-border pb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">NoorFit</p>
        <p className="mt-1 text-sm font-medium text-white">Clothing Admin Workspace</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {links.map(([to, label, Icon]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? "border border-accent/40 bg-accent/10 text-white" : "text-muted hover:bg-card hover:text-white"
              }`
            }
          >
            <Icon className="text-base" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-4 flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-card"
      >
        <FiLogOut className="text-base" />
        Logout
      </button>
    </div>
  );
}
