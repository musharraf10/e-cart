import { Link } from "react-router-dom";
import { motion } from "framer-motion";

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
    <footer className="border-t border-border-subtle bg-primary mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2"
          >
            <Link to="/" className="text-xl font-bold text-text-primary tracking-tight">
              NoorFit
            </Link>
            <p className="mt-2 text-sm text-muted">
              Premium essentials designed for movement, comfort, and daily style.
            </p>
          </motion.div>
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
      <div className="mt-10 pt-8 border-t border-border-subtle flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <span className="text-xs text-muted">
          © {new Date().getFullYear()} NoorFit. All rights reserved.
        </span>
        <span className="text-xs text-muted">
          Crafted for Comfort. Designed for Life.
        </span>
      </div>
    </footer >
  );
}
