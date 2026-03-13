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
    <aside className="bg-white rounded-xl p-3 shadow-sm h-fit">
      <nav className="space-y-1">
        {links.map(([to, label]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm ${
                isActive ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"
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
