import { useDispatch } from "react-redux";
import api from "../../api/client.js";
import { addToCart } from "../../store/slices/cartSlice.js";
import { ProductVariants } from "./ProductVariants.jsx";
import { ProductAssurances } from "./ProductAssurances.jsx";

export function ProductInfo({ product, size, color, qty, setSize, setColor, setQty }) {
  const dispatch = useDispatch();

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const stockLabel = product.inventoryCount <= 0 ? "Out of Stock" : product.inventoryCount < 5 ? "Low Stock" : "In Stock";

  const add = () => {
    if ((product.sizes?.length && !size) || (product.colors?.length && !color)) {
      alert("Please select size and color");
      return;
    }
    dispatch(addToCart({ product: product._id, name: product.name, price: product.price, image: product.images?.[0], qty, size, color }));
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
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold">{product.name}</h1>
        <p className="text-xs text-muted mt-1">Crafted for comfort. Designed for life.</p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-2xl font-semibold">${product.price.toFixed(2)}</span>
        {product.originalPrice > product.price && <span className="line-through text-muted">${product.originalPrice.toFixed(2)}</span>}
        {discount > 0 && <span className="text-xs bg-accent text-black px-2 py-1 rounded-full">{discount}% OFF</span>}
      </div>

      <p className={`text-sm font-medium ${stockLabel === "Out of Stock" ? "text-red-400" : stockLabel === "Low Stock" ? "text-amber-400" : "text-green-400"}`}>{stockLabel}</p>

      <ProductVariants sizes={product.sizes} colors={product.colors} size={size} color={color} setSize={setSize} setColor={setColor} />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center border border-borderlux rounded-full overflow-hidden text-sm">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-1">−</button>
          <span className="px-4">{qty}</span>
          <button type="button" onClick={() => setQty((q) => q + 1)} className="px-3 py-1">+</button>
        </div>
        <button onClick={add} disabled={stockLabel === "Out of Stock"} className="btn-primary flex-1 min-w-[150px] text-sm disabled:opacity-50">Add to cart</button>
        <button onClick={addWishlist} className="btn-secondary text-sm">Wishlist</button>
      </div>

      <ProductAssurances />
    </div>
  );
}
