import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HiHeart, HiOutlineHeart, HiPlus } from "react-icons/hi";
import api from "../../api/client.js";
import { addToCart } from "../../store/slices/cartSlice.js";
import { useToast } from "../ui/ToastProvider.jsx";

export function ProductCard({ product, compact = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [wishlisted, setWishlisted] = useState(false);

  const hasVariants = (product.variants?.length || 0) > 1;
  const defaultVariant = product.variants?.[0];
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
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
        price: defaultVariant?.price ?? product.price,
        image: product.images?.[0],
        qty: 1,
        size: defaultVariant?.size,
        color: defaultVariant?.color,
        sku: defaultVariant?.sku,
      }),
    );
    notify("Added to cart");
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.post(`/users/wishlist/${product._id}`);
      setWishlisted(true);
      notify("Added to wishlist");
    } catch {
      notify("Sign in to add wishlist", "error");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.2 }}
      className="group h-full flex flex-col"
    >
      <Link
        to={`/product/${product.slug}`}
        className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-[#262626] bg-card transition-colors duration-200 hover:border-accent/40"
      >
        <div className="relative aspect-square flex-shrink-0 overflow-hidden bg-[#262626]">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted text-sm">NoorFit</div>
          )}

          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="rounded-full bg-accent text-primary text-xs font-semibold px-2 py-0.5">
                {discount}% OFF
              </span>
            )}
            {product.isNewDrop && (
              <span className="rounded-full border border-accent/40 bg-[#1f1b10] text-accent text-[10px] font-semibold uppercase px-2 py-0.5">
                NEW
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleWishlist}
            className="absolute top-2.5 right-2.5 rounded-full border border-[#262626] bg-primary/90 p-2 text-white active:scale-[0.98] transition-transform"
            aria-label="Add to wishlist"
          >
            {wishlisted ? <HiHeart className="w-4 h-4 text-accent" /> : <HiOutlineHeart className="w-4 h-4" />}
          </button>
        </div>

        <div className={`flex flex-col flex-1 ${compact ? "p-3" : "p-3.5"}`}>
          <h3 className={`font-medium text-white line-clamp-2 ${compact ? "text-xs" : "text-sm"}`}>
            {product.name}
          </h3>
          <div className="mt-2 flex items-end justify-between gap-2">
            <div className="flex flex-col gap-0.5">
              <span
                className={`text-white font-semibold ${
                  compact ? "text-sm" : "text-base"
                }`}
              >
                ${Number(product.price || 0).toFixed(2)}
              </span>
              <span className="text-muted text-xs h-4 leading-4">
                {product.originalPrice && product.originalPrice > product.price
                  ? `$${product.originalPrice.toFixed(2)}`
                  : ""}
              </span>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              className="h-9 w-9 rounded-xl bg-accent text-primary inline-flex items-center justify-center active:scale-[0.98] transition-transform"
              aria-label="Quick add"
            >
              <HiPlus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
