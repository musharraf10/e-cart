import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { HiStar, HiOutlineHeart, HiHeart } from "react-icons/hi";
import api from "../../api/client.js";
import { addToCart } from "../../store/slices/cartSlice.js";
import { ProductVariants } from "./ProductVariants.jsx";
import { ProductAssurances } from "./ProductAssurances.jsx";
import { useToast } from "../ui/ToastProvider.jsx";
import { getColorImageSet } from "../../utils/productVariants.js";

export function ProductInfo({
  product,
  size,
  color,
  qty,
  setSize,
  setColor,
  setQty,
  onWishlistChange,
}) {
  const dispatch = useDispatch();
  const { notify } = useToast();

  const [adding, setAdding] = useState(false);
  const [liked, setLiked] = useState(Boolean(product?.isWishlisted));
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    setLiked(Boolean(product?.isWishlisted));
  }, [product?.isWishlisted, product?._id]);

  const selectedVariant = useMemo(
    () => (product.variants || []).find((variant) => variant.size === size && variant.color === color),
    [color, product.variants, size],
  );

  const selectedPrice = selectedVariant?.price ?? product.price;
  const selectedImage = getColorImageSet(product, color)[0] || product.images?.[0] || "";
  const hasVariantData = (product.variants || []).length > 0;

  const canAdd = hasVariantData ? Boolean(selectedVariant && size && color) : true;

  const discount =
    product.originalPrice && product.originalPrice > selectedPrice
      ? Math.round(((product.originalPrice - selectedPrice) / product.originalPrice) * 100)
      : 0;

  const stock = selectedVariant?.stock ?? 0;

  const add = async () => {
    if (!canAdd) {
      notify("Please select size & color", "error");
      return;
    }

    if (qty > stock) {
      notify("Requested quantity exceeds stock", "error");
      return;
    }

    setAdding(true);

    dispatch(
      addToCart({
        product: product._id,
        name: product.name,
        price: selectedPrice,
        image: selectedImage,
        qty,
        size,
        color,
        sku: selectedVariant?.sku,
      }),
    );

    notify("Added to cart");

    setTimeout(() => setAdding(false), 600);
  };

  const toggleWishlist = async () => {
    if (wishlistLoading) return;

    const nextLiked = !liked;
    setWishlistLoading(true);

    try {
      if (liked) {
        await api.delete(`/users/wishlist/${product._id}`);
        notify("Removed from wishlist");
      } else {
        await api.post(`/users/wishlist/${product._id}`);
        notify("Added to wishlist");
      }

      setLiked(nextLiked);
      onWishlistChange?.(nextLiked);
    } catch {
      notify("Please sign in to manage wishlist", "error");
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div className="max-w-[420px] space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
          {product.name}
        </h1>

        <div className="mt-2 flex items-center gap-2 text-sm text-muted">
          <HiStar className="w-4 h-4 text-accent" />
          <span>{(product.ratingsAverage || 0).toFixed(1)}</span>
          <span>({product.ratingsCount || 0} reviews)</span>
        </div>
        <p className="mt-2 text-sm text-muted">
          Selected color: <span className="font-medium text-white">{color || "Not selected"}</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xl font-semibold text-white">
          ${selectedPrice.toFixed(2)}
        </span>

        {product.originalPrice > selectedPrice && (
          <>
            <span className="text-muted line-through">
              ${product.originalPrice.toFixed(2)}
            </span>

            {discount > 0 && (
              <span className="rounded-full bg-accent/20 text-accent text-xs font-semibold px-2.5 py-1">
                {discount}% OFF
              </span>
            )}
          </>
        )}
      </div>

      {canAdd && stock > 0 && stock <= 3 && (
        <p className="text-amber-400 text-sm font-medium">
          Only {stock} left
        </p>
      )}

      {canAdd && stock < 1 && (
        <p className="text-red-400 text-sm font-medium">
          Out of stock
        </p>
      )}

      <div className="bg-[#171717] border border-[#262626] rounded-xl p-4 transition-all duration-200">
        <ProductVariants
          variants={product.variants}
          size={size}
          color={color}
          setSize={setSize}
          setColor={setColor}
        />
      </div>

      <div className="flex items-center gap-3 w-full">
        <div className="flex items-center rounded-xl border border-[#262626] overflow-hidden text-sm bg-primary h-12">
          <button
            type="button"
            onClick={() => setQty((currentQty) => Math.max(1, currentQty - 1))}
            className="px-4 h-full text-muted hover:text-white"
          >
            −
          </button>

          <span className="px-4 text-white min-w-[3rem] text-center">
            {qty}
          </span>

          <button
            type="button"
            onClick={() => setQty((currentQty) => currentQty + 1)}
            className="px-4 h-full text-muted hover:text-white"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={toggleWishlist}
          disabled={wishlistLoading}
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          className="h-12 w-12 flex items-center justify-center rounded-xl border border-[#262626] text-white hover:bg-card transition active:scale-90 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {liked ? (
            <HiHeart className="w-5 h-5 text-red-500" />
          ) : (
            <HiOutlineHeart className="w-5 h-5" />
          )}
        </button>

        <button
          onClick={add}
          disabled={!canAdd || stock < 1 || adding}
          className="flex-1 h-12 rounded-xl bg-accent text-primary px-6 text-sm font-medium hover:opacity-90 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {adding ? "Adding..." : "Add to cart"}
        </button>
      </div>

      {selectedImage ? (
        <p className="text-xs text-muted">Cart will use the selected color image for this SKU.</p>
      ) : null}

      <ProductAssurances />
    </div>
  );
}
