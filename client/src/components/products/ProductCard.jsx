import { Link } from "react-router-dom";

export function ProductCard({ product }) {
  return (
    <Link
      to={`/product/${product.slug}`}
      className="group bg-white rounded-xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
    >
      <div className="aspect-[4/5] bg-gray-100 overflow-hidden">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
            NoorFit
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-medium line-clamp-1">{product.name}</h3>
          {product.isNewDrop && (
            <span className="text-[10px] uppercase tracking-wide text-accent">New</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">
            ${product.price?.toFixed ? product.price.toFixed(2) : product.price}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs line-through text-gray-400">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
        {product.averageRating ? (
          <div className="text-[11px] text-gray-500">
            {product.averageRating.toFixed(1)} · {product.numReviews} reviews
          </div>
        ) : (
          <div className="text-[11px] text-gray-400">No reviews yet</div>
        )}
      </div>
    </Link>
  );
}

