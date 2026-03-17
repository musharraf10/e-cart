import { motion } from "framer-motion";

export function HeroBanner({ title, subtitle, children, className = "" }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative rounded-2xl overflow-hidden bg-card border border-[#262626] px-6 py-12 md:py-16 lg:py-20 ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10 max-w-2xl">
        {title && (
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white tracking-tight leading-tight">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-muted text-base md:text-lg mt-4 max-w-xl">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-6 md:mt-8">{children}</div>}
      </div>
    </motion.section>
  );
}
