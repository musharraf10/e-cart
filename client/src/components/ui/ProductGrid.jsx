import { motion } from "framer-motion";

export function ProductGrid({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4 lg:gap-6 items-stretch ${className}`}
    >
      {children}
    </motion.div>
  );
}
