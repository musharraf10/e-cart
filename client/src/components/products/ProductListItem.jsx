import { Link } from "react-router-dom";
import { getProductRoute } from "../../utils/productVariants.js";

export function ProductListItem({ product }) {
  const routeTo = product.routeTo || getProductRoute(product, product.displayColor);
  const image = product.displayImage || product.images?.[0] || "";
  const price = Number(product.displayPrice ?? product.price ?? 0);

  return (
    <Link to={routeTo} className="flex gap-4 rounded-xl border border-border bg-card p-3 transition-colors hover:border-accent/40">
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-primary">
        {image ? <img src={image} alt={product.name} className="h-full w-full object-cover" /> : null}
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="line-clamp-2 text-sm font-semibold text-white">{product.name}</p>
        <p className="line-clamp-2 text-xs text-muted">{product.description}</p>
        <p className="pt-1 text-sm font-semibold text-white">${price.toFixed(2)}</p>
      </div>
    </Link>
  );
}
