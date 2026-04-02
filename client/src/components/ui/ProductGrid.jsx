import { motion } from "framer-motion";

export function ProductGrid({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className={`grid grid-cols-2 gap-2 md:gap-3 lg:grid-cols-4 lg:gap-3 items-stretch ${className}`}
    >
      {children}
    </motion.div>
  );
}
