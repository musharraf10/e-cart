import { NavLink } from "react-router-dom";

const items = [
  { to: "/", label: "Home", icon: "⌂" },
  { to: "/", label: "Shop", icon: "◫" },
  { to: "/", label: "Search", icon: "⌕" },
  { to: "/cart", label: "Cart", icon: "🛒" },
  { to: "/account", label: "Account", icon: "◉" },
];

export function MobileBottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[#121212]/95 border-t border-borderlux backdrop-blur">
      <div className="grid grid-cols-5 text-[11px]">
        {items.map((item) => (
          <NavLink
            key={`${item.label}-${item.to}`}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 transition-all ${
                isActive ? "text-accent" : "text-muted"
              }`
            }
          >
            <span className="text-base leading-none">{item.icon}</span>
            <span className="mt-1">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
