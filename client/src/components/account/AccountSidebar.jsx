import { NavLink } from "react-router-dom";

const links = [
  { to: "/account/profile", label: "Profile" },
  { to: "/account/orders", label: "Orders" },
  { to: "/account/addresses", label: "Addresses" },
  { to: "/account/wishlist", label: "Wishlist" },
  { to: "/account/settings", label: "Account Settings" },
];

export function AccountSidebar() {
  return (
    <aside className="lux-card p-3 h-fit">
      <nav className="grid grid-cols-2 md:grid-cols-1 gap-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `rounded-xl px-3 py-2 text-sm transition-all ${
                isActive ? "bg-accent text-black font-semibold" : "text-muted hover:text-white hover:bg-[#111111]"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
