import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HiHeart, HiOutlineHeart, HiPlus } from "react-icons/hi";
import api from "../../api/client.js";
import { addToCart } from "../../store/slices/cartSlice.js";
import { useToast } from "../ui/ToastProvider.jsx";
import {
  getColorSwatch,
  getProductColors,
  getProductRoute,
} from "../../utils/productVariants.js";

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
  const inventory = product.variantInventory ?? product.inventoryCount ?? 0;
  const discount =
    product.originalPrice && product.originalPrice > displayPrice
      ? Math.round(((product.originalPrice - displayPrice) / product.originalPrice) * 100)
      : 0;

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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.2 }}
      className="group h-full flex flex-col"
    >
      <Link
        to={routeTo}
        className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-[#262626] bg-card transition-colors duration-200 hover:border-accent/40"
      >
        <div className="relative aspect-square flex-shrink-0 overflow-hidden bg-[#262626]">
          {displayImage ? (
            <img
              src={displayImage}
              alt={activeColor ? `${product.name} in ${activeColor}` : product.name}
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
            {inventory < 1 && (
              <span className="rounded-full border border-red-500/30 bg-red-500/10 text-red-300 text-[10px] font-semibold uppercase px-2 py-0.5">
                Out of stock
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
          <div className="space-y-1">
            <h3 className={`font-medium text-white line-clamp-2 ${compact ? "text-xs" : "text-sm"}`}>
              {product.name}
            </h3>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted min-h-4">
                Color:
              </p>
              {availableColors.length > 1 && (
                <div className="flex items-center gap-1.5">
                  {availableColors.slice(0, 4).map((color) => {
                    const selected = color === activeColor;
                    return (
                      <span
                        key={color}
                        title={color}
                        className={`h-3 w-3 rounded-full border transition-all ${selected ? "scale-110 border-accent shadow-[0_0_0_1px_rgba(166,198,85,0.45)]" : "border-white/20"}`}
                        style={{ backgroundColor: getColorSwatch(color) }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <div className="mt-2 flex items-end justify-between gap-2">
            <div className="flex flex-col gap-0.5">
              <span className={`text-white font-semibold ${compact ? "text-sm" : "text-base"}`}>
                ₹{displayPrice.toFixed(2)}
              </span>
              <span className="text-muted text-xs h-4 leading-4 line-through">
                {product.originalPrice && product.originalPrice > displayPrice
                  ? `₹${product.originalPrice.toFixed(2)}`
                  : inventory < 1
                    ? "Unavailable"
                    : " "}
              </span>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              className="h-5 w-5 rounded-xl bg-accent text-primary inline-flex items-center justify-center active:scale-[0.98] transition-transform"
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
