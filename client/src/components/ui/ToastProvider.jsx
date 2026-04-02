import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback((message, type = "success", options = {}) => {
    const id = Math.random().toString(36).substring(2, 11);
    const { duration = 2400, actionLabel, onAction } = options;

    setToasts((prev) => [...prev, { id, message, type, actionLabel, onAction }]);
    window.setTimeout(() => {
      dismiss(id);
    }, duration);
  }, [dismiss]);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-[max(1rem,env(safe-area-inset-top,0px))] left-1/2 -translate-x-1/2 sm:left-auto sm:right-4 sm:translate-x-0 z-[120] w-[calc(100vw-1.5rem)] max-w-md space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.96 }}
              className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-card ${toast.type === "error"
                  ? "border-border bg-card text-red-300"
                  : "border-border bg-card text-accent"
                }`}
            >
              <div className="flex items-center gap-3">
                <span>{toast.message}</span>
                {toast.actionLabel && toast.onAction ? (
                  <button
                    type="button"
                    className="rounded-md border border-border px-2 py-1 text-xs text-foreground hover:bg-border/50"
                    onClick={() => {
                      toast.onAction();
                      dismiss(toast.id);
                    }}
                  >
                    {toast.actionLabel}
                  </button>
                ) : null}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
