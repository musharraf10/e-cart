import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HiHeart, HiOutlineHeart, HiPlus } from "react-icons/hi";
import api from "../../api/client.js";
import { addToCart } from "../../store/slices/cartSlice.js";
import { useToast } from "../ui/ToastProvider.jsx";
import { getProductColors, getProductRoute } from "../../utils/productVariants.js";

export function ProductCard({ product, compact = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [wishlisted, setWishlisted] = useState(false);

  const availableColors = useMemo(() => getProductColors(product), [product]);
  const activeColor = product.displayColor || availableColors[0] || "";
  const displayPrice = Number(product.displayPrice ?? product.price ?? 0);
  const displayImage = product.displayImage || product.images?.[0] || "";
  const routeTo = product.routeTo || getProductRoute(product, activeColor);
  const hasVariantChoices = availableColors.length > 0 || (product.variants?.length || 0) > 1;
  const defaultVariant = useMemo(() => {
    const variants = product.variants || [];
    if (activeColor) {
      return (
        variants.find((variant) => variant.color === activeColor && Number(variant.stock || 0) > 0) ||
        variants.find((variant) => variant.color === activeColor) ||
        variants[0]
      );
    }
    return variants[0];
  }, [activeColor, product.variants]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasVariantChoices) {
      navigate(routeTo);
      return;
    }

    dispatch(
      addToCart({
        product: product._id,
        name: product.name,
        price: defaultVariant?.price ?? displayPrice,
        image: displayImage,
        qty: 1,
        size: defaultVariant?.size,
        color: activeColor || defaultVariant?.color,
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.988 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="group h-full flex flex-col"
    >
      <Link
        to={routeTo}
        className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-bg-secondary transition-transform duration-300"
      >
        <div className="relative aspect-[3/4] flex-shrink-0 overflow-hidden bg-neutral-200 dark:bg-neutral-900">
          {displayImage ? (
            <img
              src={displayImage}
              alt={activeColor ? `${product.name} in ${activeColor}` : product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">NoorFit</div>
          )}

          <button
            type="button"
            onClick={handleWishlist}
            className="absolute top-2.5 right-2.5 rounded-full bg-bg-primary/85 p-1.5 text-text-primary active:scale-[0.98] transition-transform duration-200"
            aria-label="Add to wishlist"
          >
            {wishlisted ? <HiHeart className="h-4 w-4" /> : <HiOutlineHeart className="h-4 w-4" />}
          </button>
        </div>

        <div className={`flex items-end justify-between gap-2 ${compact ? "p-2.5" : "p-3"}`}>
          <div className="min-w-0 space-y-0.5">
            <h3 className={`line-clamp-1 text-text-primary ${compact ? "text-xs" : "text-sm"}`}>
              {product.name}
            </h3>
            <span className={`font-semibold text-text-primary ${compact ? "text-sm" : "text-base"}`}>
              ${displayPrice.toFixed(2)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="h-7 w-7 rounded-full border border-border-subtle bg-bg-primary text-text-primary inline-flex items-center justify-center active:scale-[0.98] transition-transform duration-200"
            aria-label="Quick add"
          >
            <HiPlus className="h-4 w-4" />
          </button>
        </div>
      </Link>
    </motion.div>
  );
}
