import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const footerLinks = [
  { label: "Shop", to: "/" },
  { label: "Cart", to: "/cart" },
  { label: "Account", to: "/account" },
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
            <p className="text-muted text-sm mt-2 max-w-md">
              Crafted for Comfort. Designed for Life. Premium everyday wear for
              those who move.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
              Quick links
            </h3>
            <ul className="space-y-2">
              {footerLinks.map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-muted hover:text-accent transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
        <div className="mt-10 pt-8 border-t border-border-subtle flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <span className="text-xs text-muted">
            © {new Date().getFullYear()} NoorFit. All rights reserved.
          </span>
          <span className="text-xs text-muted">
            Crafted for Comfort. Designed for Life.
          </span>
        </div>
      </div>
    </footer>
  );
}
