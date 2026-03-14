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
    <aside className="bg-[#171717] border border-[#262626] rounded-2xl p-6 h-fit sticky top-24">
      <div className="mb-8">
        <h2 className="text-white text-lg font-semibold tracking-tight">My Account</h2>
        <p className="text-[#a1a1aa] text-xs mt-1">Manage your profile and preferences</p>
      </div>
      <nav className="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${isActive
                ? "bg-[#d4af37] text-white shadow-lg shadow-[#d4af37]/20"
                : "text-[#a1a1aa] hover:text-white hover:bg-[#262626]"
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
