import { Link } from "react-router-dom";

const footerLinkGroups = [
  [
    { label: "About", to: "/about" },
    { label: "Support", to: "/support" },
    { label: "Orders", to: "/account/orders" },
  ],
  [
    { label: "Terms", to: "/terms" },
    { label: "Privacy", to: "/privacy" },
  ],
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[#262626] bg-[#0f0f0f]">
      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        <div className="space-y-6">
          <div>
            <Link to="/" className="text-xl font-semibold text-white transition-colors hover:text-white">
              NoorFit
            </Link>
            <p className="mt-2 text-sm text-muted">
              Premium essentials designed for movement, comfort, and daily style.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {footerLinkGroups.map((group, idx) => (
              <ul key={idx} className="space-y-2">
                {group.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm text-muted transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>

        <div className="mt-6 border-t border-[#262626] pt-4">
          <p className="text-xs text-muted">© {new Date().getFullYear()} NoorFit. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
