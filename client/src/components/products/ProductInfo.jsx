import { useState } from "react";
import { useDispatch } from "react-redux";
import { HiStar } from "react-icons/hi";
import api from "../../api/client.js";
import { addToCart } from "../../store/slices/cartSlice.js";
import { ProductVariants } from "./ProductVariants.jsx";
import { ProductAssurances } from "./ProductAssurances.jsx";
import { useToast } from "../ui/ToastProvider.jsx";

export function ProductInfo({ product, size, color, qty, setSize, setColor, setQty }) {
  const dispatch = useDispatch();
  const { notify } = useToast();
  const [adding, setAdding] = useState(false);

  const selectedVariant = (product.variants || []).find(
    (variant) => variant.size === size && variant.color === color,
  );

  const selectedPrice = selectedVariant?.price ?? product.price;
  const hasSizeVariants = (product.variants || []).some((variant) => variant.size);
  const hasVariantData = (product.variants || []).length > 0;
  // Require both color + size before enabling cart for variant products.
  const canAdd = hasVariantData ? Boolean(selectedVariant && size && color) : true;

  const discount =
    product.originalPrice && product.originalPrice > selectedPrice
      ? Math.round(((product.originalPrice - selectedPrice) / product.originalPrice) * 100)
      : 0;

  const stock = selectedVariant?.stock ?? 0;

  const add = async () => {
    if (!canAdd) {
      notify("Please select a size", "error");
      return;
    }

    if (qty > stock) {
      notify("Requested quantity exceeds available stock", "error");
      return;
    }

    setAdding(true);
    dispatch(
      addToCart({
        product: product._id,
        name: product.name,
        price: selectedPrice,
        image: product.images?.[0],
        qty,
        size,
        color,
        sku: selectedVariant?.sku,
      }),
    );
    notify("Added to cart");
    setTimeout(() => setAdding(false), 500);
  };

  const addWishlist = async () => {
    try {
      await api.post(`/users/wishlist/${product._id}`);
      notify("Added to wishlist");
    } catch {
      notify("Please sign in to add wishlist", "error");
    }
  };

  return (
    <div className="max-w-[420px] space-y-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">{product.name}</h1>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted">
          <HiStar className="w-4 h-4 text-accent" />
          <span>{(product.ratingsAverage || 0).toFixed(1)}</span>
          <span>({product.ratingsCount || 0} reviews)</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xl font-semibold text-white">${selectedPrice.toFixed(2)}</span>
        {product.originalPrice > selectedPrice && (
          <>
            <span className="text-muted line-through">${product.originalPrice.toFixed(2)}</span>
            {discount > 0 && (
              <span className="rounded-full bg-accent/20 text-accent text-xs font-semibold px-2.5 py-1">
                {discount}% OFF
              </span>
            )}
          </>
        )}
      </div>

      {canAdd && stock > 0 && stock <= 3 && (
        <p className="text-amber-400 text-sm font-medium">Only {stock} left</p>
      )}
      {canAdd && stock < 1 && (
        <p className="text-red-400 text-sm font-medium">Out of stock</p>
      )}

      <div className="bg-[#171717] border border-[#262626] rounded-xl p-4">
        <ProductVariants
          variants={product.variants}
          size={size}
          color={color}
          setSize={setSize}
          setColor={setColor}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-full border border-[#262626] overflow-hidden text-sm bg-primary">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 py-2.5 text-muted hover:text-white">−</button>
          <span className="px-4 py-2.5 text-white min-w-[3rem] text-center">{qty}</span>
          <button type="button" onClick={() => setQty((q) => q + 1)} className="px-4 py-2.5 text-muted hover:text-white">+</button>
        </div>
        <button
          onClick={add}
          disabled={!canAdd || stock < 1 || adding}
          className="flex-1 min-w-[140px] h-12 rounded-xl bg-accent text-primary px-6 text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {adding ? "Adding..." : "Add to cart"}
        </button>
        <button onClick={addWishlist} className="rounded-xl border border-[#262626] px-5 py-3 text-sm font-medium text-white hover:bg-card">
          Wishlist
        </button>
      </div>

      <ProductAssurances />
    </div>
  );
}
