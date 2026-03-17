import { useDispatch } from "react-redux";
import api from "../../api/client.js";
import { addToCart } from "../../store/slices/cartSlice.js";
import { ProductVariants } from "./ProductVariants.jsx";
import { ProductAssurances } from "./ProductAssurances.jsx";

export function ProductInfo({
  product,
  size,
  color,
  qty,
  setSize,
  setColor,
  setQty,
}) {
  const dispatch = useDispatch();

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100
        )
      : 0;

  const stockLabel =
    product.inventoryCount <= 0
      ? "Out of Stock"
      : product.inventoryCount < 5
        ? "Low Stock"
        : "In Stock";

  const add = () => {
    if (
      (product.sizes?.length && !size) ||
      (product.colors?.length && !color)
    ) {
      alert("Please select size and color");
      return;
    }
    dispatch(
      addToCart({
        product: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0],
        qty,
        size,
        color,
      })
    );
  };

  const addWishlist = async () => {
    try {
      await api.post(`/users/wishlist/${product._id}`);
      alert("Added to wishlist");
    } catch {
      alert("Please sign in to add wishlist");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
          {product.name}
        </h1>
        <p className="text-muted text-sm mt-1">
          Crafted for comfort. Designed for life.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-2xl font-semibold text-white">
          ${product.price.toFixed(2)}
        </span>
        {product.originalPrice > product.price && (
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

      <p
        className={`text-sm font-medium ${
          stockLabel === "Out of Stock"
            ? "text-red-400"
            : stockLabel === "Low Stock"
              ? "text-amber-400"
              : "text-emerald-400"
        }`}
      >
        {stockLabel}
      </p>

      <ProductVariants
        sizes={product.sizes}
        colors={product.colors}
        size={size}
        color={color}
        setSize={setSize}
        setColor={setColor}
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-full border border-[#262626] overflow-hidden text-sm bg-primary">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-4 py-2.5 text-muted hover:text-white transition-colors"
          >
            −
          </button>
          <span className="px-4 py-2.5 text-white min-w-[3rem] text-center">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            className="px-4 py-2.5 text-muted hover:text-white transition-colors"
          >
            +
          </button>
        </div>
        <button
          onClick={add}
          disabled={stockLabel === "Out of Stock"}
          className="flex-1 min-w-[140px] rounded-xl bg-accent text-primary py-3 px-6 text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Add to cart
        </button>
        <button
          onClick={addWishlist}
          className="rounded-xl border border-[#262626] px-5 py-3 text-sm font-medium text-white hover:bg-card transition-colors"
        >
          Wishlist
        </button>
      </div>

      <ProductAssurances />
    </div>
  );
}
