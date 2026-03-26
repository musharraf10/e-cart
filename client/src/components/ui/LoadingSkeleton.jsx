import { motion } from "framer-motion";

export function LoadingSkeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-[#262626] ${className}`}
      aria-hidden
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-xl overflow-hidden bg-card border border-[#262626] h-full flex flex-col"
    >
      <LoadingSkeleton className="aspect-[4/5] w-full" />
      <div className="p-4 space-y-3">
        <LoadingSkeleton className="h-4 w-3/4" />
        <div className="flex gap-2">
          <LoadingSkeleton className="h-5 w-16" />
          <LoadingSkeleton className="h-4 w-12" />
        </div>
        <LoadingSkeleton className="h-3 w-1/2" />
      </div>
    </motion.div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4 lg:gap-6 items-stretch">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
