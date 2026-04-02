import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { HiOutlineHeart, HiHeart } from "react-icons/hi";
import api from "../../api/client.js";
import { addToCart } from "../../store/slices/cartSlice.js";
import { ProductVariants } from "./ProductVariants.jsx";
import { useToast } from "../ui/ToastProvider.jsx";
import { getColorImageSet } from "../../utils/productVariants.js";

export function ProductInfo({ product, size, color, qty, setSize, setColor, setQty, onWishlistChange }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
  const stock = selectedVariant?.stock ?? 0;

  const add = async () => {
    if (!canAdd) return notify("Please select size & color", "error");
    if (qty > stock) return notify("Requested quantity exceeds stock", "error");

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
    setTimeout(() => setAdding(false), 300);
  };

  const buyNow = async () => {
    await add();
    navigate("/checkout");
  };

  const toggleWishlist = async () => {
    if (wishlistLoading) return;
    const nextLiked = !liked;
    setWishlistLoading(true);
    try {
      if (liked) {
        await api.delete(`/users/wishlist/${product._id}`);
      } else {
        await api.post(`/users/wishlist/${product._id}`);
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
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <p className="mt-1 text-xl font-semibold">${selectedPrice.toFixed(2)}</p>
      </div>

      <div className="surface-card p-4">
        <ProductVariants variants={product.variants} size={size} color={color} setSize={setSize} setColor={setColor} />
      </div>

      <div className="flex items-center gap-2">
        <div className="flex h-11 items-center overflow-hidden rounded-xl border border-border-subtle">
          <button type="button" onClick={() => setQty((n) => Math.max(1, n - 1))} className="px-4 text-text-muted">−</button>
          <span className="min-w-10 text-center text-sm">{qty}</span>
          <button type="button" onClick={() => setQty((n) => n + 1)} className="px-4 text-text-muted">+</button>
        </div>

        <button
          type="button"
          onClick={toggleWishlist}
          disabled={wishlistLoading}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border-subtle"
        >
          {liked ? <HiHeart className="h-5 w-5 text-accent" /> : <HiOutlineHeart className="h-5 w-5" />}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={add}
          disabled={!canAdd || stock < 1 || adding}
          className="h-11 rounded-xl bg-accent px-4 text-sm font-semibold text-bg-primary disabled:opacity-50"
        >
          Add to cart
        </button>
        <button
          onClick={buyNow}
          disabled={!canAdd || stock < 1 || adding}
          className="h-11 rounded-xl border border-border-subtle px-4 text-sm font-semibold disabled:opacity-50"
        >
          Buy now
        </button>
      </div>
    </div>
  );
}
