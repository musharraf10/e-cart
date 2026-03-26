import { Link } from "react-router-dom";
import { getProductRoute } from "../../utils/productVariants.js";

export function ProductListItem({ product }) {
  const routeTo = product.routeTo || getProductRoute(product, product.displayColor);
  const image = product.displayImage || product.images?.[0] || "";
  const price = Number(product.displayPrice ?? product.price ?? 0);
  const originalPrice = Number(product.compareAtPrice ?? product.originalPrice ?? 0);
  const hasOriginalPrice = originalPrice > price;
  const discountPercent = hasOriginalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : null;
  const rating = Number(product.rating ?? product.averageRating ?? 0);
  const ratingCount = Number(product.ratingCount ?? product.reviewCount ?? 0);

  return (
    <Link
      to={routeTo}
      onClick={() => sessionStorage.setItem("shopScroll", String(window.scrollY))}
      className="group relative flex gap-4 rounded-xl border border-border bg-card p-3 transition duration-200 hover:border-accent/30 active:scale-[0.98]"
    >
      <div className="h-28 w-24 shrink-0 overflow-hidden rounded-lg bg-primary sm:w-28">
        {image ? <img src={image} alt={product.name} className="h-full w-full object-cover" /> : null}
      </div>
      <div className="min-w-0 flex-1 space-y-1.5 pr-8">
        <p className="line-clamp-2 text-sm font-medium text-white">{product.name}</p>
        <p className="line-clamp-2 text-xs text-muted">{product.description}</p>
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="text-amber-400">★ {rating.toFixed(1)}</span>
          <span>({ratingCount})</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <span className="text-sm font-semibold text-accent">${price.toFixed(2)}</span>
          {hasOriginalPrice ? <span className="text-xs text-muted line-through">${originalPrice.toFixed(2)}</span> : null}
          {discountPercent ? (
            <span className="rounded-md border border-green-500/30 bg-green-500/10 px-1.5 py-0.5 text-[10px] font-medium text-green-400">
              {discountPercent}% OFF
            </span>
          ) : null}
        </div>
        <p className="text-xs text-green-400">Free delivery</p>
      </div>
      <span className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-primary/80 text-muted transition-colors group-hover:text-white">
        ♡
      </span>
    </Link>
  );
}
