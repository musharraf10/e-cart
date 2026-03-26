import { motion } from "framer-motion";

export function SectionHeader({ title, subtitle, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between gap-3 mb-6 md:mb-8"
    >
      <div className="min-w-0">
        <h2 className="text-xl md:text-2xl font-semibold text-white tracking-tight truncate">
          {title}
        </h2>

        {subtitle && (
          <p className="text-muted text-sm mt-1 truncate">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </motion.div>
  );
}