import { AnimatePresence, motion } from "framer-motion";

export function GlobalLoader({ show }) {
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="global-loader"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-black"
          aria-live="polite"
          aria-label="Loading NoorFit"
        >
          <motion.p
            initial={{ opacity: 0.7, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="font-heading text-xl font-medium tracking-[0.35em] text-white"
          >
            NOORFIT
          </motion.p>
          <div className="mt-5 h-1.5 w-36 overflow-hidden rounded-full bg-white/20">
            <motion.div
              className="h-full rounded-full bg-accent"
              initial={{ x: "-100%" }}
              animate={{ x: ["-100%", "110%"] }}
              transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
