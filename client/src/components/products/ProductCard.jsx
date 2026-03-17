import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HiHeart, HiOutlineHeart } from "react-icons/hi";
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
      whileHover={compact ? { scale: 1.01 } : { scale: 1.03 }}
      transition={{ duration: 0.2 }}
      className="group h-full flex flex-col"
    >
      <Link
        to={`/product/${product.slug}`}
        className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-[#262626] bg-card transition-all duration-300 hover:border-accent/40"
      >
        <div className="relative aspect-[4/5] flex-shrink-0 overflow-hidden bg-[#262626]">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              loading="lazy"
              className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105`}
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
            className="absolute top-3 right-3 rounded-full border border-[#262626] bg-primary/90 p-2 text-white"
            aria-label="Add to wishlist"
          >
            {wishlisted ? <HiHeart className="w-4 h-4 text-accent" /> : <HiOutlineHeart className="w-4 h-4" />}
          </button>

          <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-3">
            <div className="w-full grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="rounded-lg bg-accent text-primary px-3 py-2 text-xs font-semibold"
              >
                Add to Cart
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/product/${product.slug}`);
                }}
                className="rounded-lg border border-[#262626] bg-primary/90 text-white px-3 py-2 text-xs font-semibold"
              >
                {hasVariants ? "Select Size" : "View"}
              </button>
            </div>
          </div>
        </div>

        <div className={`flex flex-col flex-1 ${compact ? "p-3" : "p-4"}`}>
          <h3 className={`font-medium text-white line-clamp-2 ${compact ? "text-xs" : "text-sm"}`}>{product.name}</h3>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-white font-semibold ${compact ? "text-sm" : "text-base"}`}>${Number(product.price || 0).toFixed(2)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-muted text-xs line-through">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
