import { NavLink } from "react-router-dom";

const links = [
  ["/admin/dashboard", "Dashboard Overview"],
  ["/admin/products", "Product Management"],
  ["/admin/inventory", "Inventory Management"],
  ["/admin/orders", "Order Management"],
  ["/admin/customers", "Customer Management"],
  ["/admin/reviews", "Review Moderation"],
  ["/admin/coupons", "Coupons / Promotions"],
  ["/admin/drops", "New Drops Scheduling"],
  ["/admin/returns", "Disputes & Returns"],
  ["/admin/analytics", "Analytics & Reports"],
  ["/admin/settings", "Settings"],
];

export function AdminSidebar() {
  return (
    <aside className="bg-card border border-[#262626] rounded-xl p-4 h-fit sticky top-24">
      <nav className="space-y-1">
        {links.map(([to, label]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `block rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-accent text-primary"
                  : "text-muted hover:text-white hover:bg-[#262626]"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
