import { motion } from "framer-motion";

export function DesktopBlockScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-card"
      >
        <p className="text-sm uppercase tracking-[0.25em] text-accent">NoorFit</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">
          NoorFit is optimized for mobile devices
        </h1>
        <p className="mt-4 text-sm text-muted">
          Customer shopping is available on mobile only.
          <br />
          Admin dashboard access is available at <span className="text-white">/admin</span>.
        </p>
      </motion.div>
    </div>
  );
}
