import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getProductColors, getProductRoute } from "../../utils/productVariants.js";

export function ProductCard({ product, compact = false }) {
  const availableColors = getProductColors(product);
  const activeColor = product.displayColor || availableColors[0] || "";
  const displayPrice = Number(product.displayPrice ?? product.price ?? 0);
  const displayImage = product.displayImage || product.images?.[0] || "";
  const routeTo = product.routeTo || getProductRoute(product, activeColor);

  return (
    <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }} className="h-full">
      <Link to={routeTo} className="surface-card flex h-full flex-col overflow-hidden">
        <div className="aspect-square bg-bg-primary">
          {displayImage ? (
            <img
              src={displayImage}
              alt={activeColor ? `${product.name} in ${activeColor}` : product.name}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
        <div className={`${compact ? "p-2.5" : "p-3"} space-y-1`}>
          <h3 className="line-clamp-2 text-sm font-medium text-text-primary">{product.name}</h3>
          <p className="text-sm font-semibold text-text-primary">${displayPrice.toFixed(2)}</p>
        </div>
      </Link>
    </motion.div>
  );
}
