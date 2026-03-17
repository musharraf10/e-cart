import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HiShoppingCart } from "react-icons/hi";
import { addToCart } from "../../store/slices/cartSlice.js";

export function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const hasVariants = (product.sizes?.length > 0) || (product.colors?.length > 0);
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
      : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasVariants) {
      navigate(`/product/${product.slug}`);
      return;
    }
    dispatch(
      addToCart({
        product: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0],
        qty: 1,
        size: product.sizes?.[0],
        color: product.colors?.[0],
      })
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group h-full flex flex-col"
    >
      <Link
        to={`/product/${product.slug}`}
        className="flex flex-col h-full rounded-xl bg-card border border-[#262626] overflow-hidden hover:border-[#262626]/80 hover:shadow-card transition-all duration-300"
      >
        <div className="relative aspect-[4/5] bg-[#262626] overflow-hidden flex-shrink-0">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted text-sm">
              NoorFit
            </div>
          )}
          {discount > 0 && (
            <span className="absolute top-3 left-3 rounded-full bg-accent text-primary text-xs font-semibold px-2 py-0.5">
              {discount}% OFF
            </span>
          )}
          {product.isNewDrop && (
            <span className="absolute top-3 right-3 rounded-full bg-primary/90 text-accent text-[10px] font-semibold uppercase tracking-wider px-2 py-1">
              New
            </span>
          )}
          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex items-center gap-2 rounded-xl bg-accent text-primary px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg"
            >
              <HiShoppingCart className="w-4 h-4" />
              {hasVariants ? "Select options" : "Add to cart"}
            </button>
          </div>
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-sm font-medium text-white line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-white font-semibold">
              $
              {typeof product.price === "number"
                ? product.price.toFixed(2)
                : product.price}
            </span>
            {product.originalPrice &&
              product.originalPrice > product.price && (
                <span className="text-muted text-xs line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
          </div>
          {(product.ratingsAverage > 0 || product.averageRating > 0) ? (
            <p className="text-muted text-xs mt-1">
              {(product.ratingsAverage ?? product.averageRating).toFixed(1)} ·{" "}
              {product.ratingsCount ?? product.numReviews ?? 0} reviews
            </p>
          ) : (
            <p className="text-muted text-xs mt-1">No reviews yet</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
