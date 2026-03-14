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
    <aside className="lux-card p-3 h-fit">
      <nav className="space-y-1">
        {links.map(([to, label]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `block rounded-xl px-3 py-2 text-sm transition-all ${
                isActive ? "bg-accent text-black font-semibold" : "text-muted hover:text-white hover:bg-[#111111]"
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
