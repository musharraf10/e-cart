import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import api from "../../api/client.js";
import { addToCart } from "../../store/slices/cartSlice.js";

export function WishlistPage() {
  const [items, setItems] = useState([]);
  const dispatch = useDispatch();

  const load = () => api.get("/users/wishlist").then(({ data }) => setItems(data));
  useEffect(() => {
    load();
  }, []);

  const moveToCart = (p) => {
    const defaultVariant = p.variants?.[0];
    dispatch(
      addToCart({
        product: p._id,
        name: p.name,
        image: p.images?.[0],
        price: defaultVariant?.price ?? p.price,
        qty: 1,
        size: defaultVariant?.size,
        color: defaultVariant?.color,
        sku: defaultVariant?.sku,
      })
    );
    api.delete(`/users/wishlist/${p._id}`).then(load);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Wishlist</h1>
        <p className="text-[#a1a1aa] text-sm mt-1">
          {items.length} {items.length === 1 ? "item" : "items"} saved
        </p>
      </div>

      {items.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((p) => (
            <div
              key={p._id}
              className="bg-[#171717] border border-[#262626] rounded-2xl overflow-hidden shadow-xl hover:border-[#d4af37] transition-all duration-200 group flex flex-col"
            >
              <div className="relative h-64 overflow-hidden bg-[#0f0f0f]">
                {p.images?.[0] ? (
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">👕</div>
                )}
                <button
                  onClick={() => api.delete(`/users/wishlist/${p._id}`).then(load)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-red-600 text-white transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-white font-semibold text-sm line-clamp-2 mb-2">
                  {p.name}
                </h3>

                <div className="mt-auto">
                  <p className="text-[#d4af37] text-xl font-bold mb-4">
                    ${p.price?.toFixed(2)}
                  </p>

                  <button
                    onClick={() => moveToCart(p)}
                    className="w-full px-4 py-3 rounded-xl bg-accent text-primary text-sm font-semibold hover:opacity-90 transition-all duration-200 shadow-lg shadow-accent/20"
                  >
                    Move to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#171717] border border-[#262626] rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">💭</div>
          <h3 className="text-white text-lg font-semibold mb-2">Wishlist is empty</h3>
          <p className="text-[#a1a1aa] text-sm">Add items to your wishlist to save them for later</p>
        </div>
      )}
    </div>
  );
}
