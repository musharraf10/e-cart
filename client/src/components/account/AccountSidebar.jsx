import { NavLink } from "react-router-dom";
import { HiUser, HiClipboardList, HiLocationMarker, HiHeart, HiCog } from "react-icons/hi";

const links = [
  { to: "/account/profile", label: "Profile", icon: HiUser },
  { to: "/account/orders", label: "Orders", icon: HiClipboardList },
  { to: "/account/addresses", label: "Addresses", icon: HiLocationMarker },
  { to: "/account/wishlist", label: "Wishlist", icon: HiHeart },
  { to: "/account/settings", label: "Account Settings", icon: HiCog },
];

export function AccountSidebar() {
  return (
    <aside className="lg:sticky lg:top-24 h-fit">
      <div className="mb-6 lg:mb-8">
        <h2 className="text-white text-lg font-semibold tracking-tight">
          My Account
        </h2>
        <p className="text-muted text-xs mt-1">
          Manage your profile and preferences
        </p>
      </div>
      <nav className="flex flex-wrap gap-2 lg:flex-col lg:flex-nowrap lg:space-y-0 lg:space-x-0 lg:gap-0">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-accent text-primary shadow-lg shadow-accent/20"
                  : "text-muted hover:text-white hover:bg-[#262626] bg-card border border-[#262626] lg:border-0 lg:bg-transparent"
              }`
            }
          >
            <link.icon className="w-5 h-5 flex-shrink-0" />
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
