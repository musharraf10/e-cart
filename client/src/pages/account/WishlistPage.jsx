import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineTrash, HiShoppingCart, HiHeart } from "react-icons/hi";
import api from "../../api/client.js";
import { addToCart } from "../../store/slices/cartSlice.js";

/* ── helpers ────────────────────────────────────────────────── */
function getVariantLabel(p) {
  const v = p.variants?.[0];
  if (!v) return null;
  return [v.color, v.size].filter(Boolean).join(" · ");
}

/* ── component ──────────────────────────────────────────────── */
export function WishlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moving, setMoving] = useState(null);
  const [removing, setRemoving] = useState(null);
  const dispatch = useDispatch();

  const load = () =>
    api
      .get("/users/wishlist")
      .then(({ data }) => setItems(data))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleRemove = (id) => {
    setRemoving(id);
    api.delete(`/users/wishlist/${id}`).then(() => {
      setItems((prev) => prev.filter((p) => p._id !== id));
      setRemoving(null);
    });
  };

  const handleMoveToCart = (p) => {
    setMoving(p._id);
    const v = p.variants?.[0];
    dispatch(
      addToCart({
        product: p._id,
        name: p.name,
        image: p.images?.[0],
        price: v?.price ?? p.price,
        qty: 1,
        size: v?.size,
        color: v?.color,
        sku: v?.sku,
      })
    );
    api.delete(`/users/wishlist/${p._id}`).then(() => {
      setItems((prev) => prev.filter((i) => i._id !== p._id));
      setMoving(null);
    });
  };

  return (
    /* 
      No fixed height, no overflow-hidden here.
      Let the parent layout / page shell handle scrolling.
      This component just stacks naturally.
    */
    <div className="w-full pt-4 pb-16">

      {/* ── header ──────────────────────────────────── */}
      <div className="mb-4 max-w-lg mx-auto">
        <h1 className="text-lg font-bold text-white tracking-tight">Wishlist</h1>
        <p className="text-muted text-xs mt-0.5">
          {loading
            ? "Loading…"
            : `${items.length} ${items.length === 1 ? "item" : "items"} saved`}
        </p>
      </div>

      {/* ── skeleton ────────────────────────────────── */}
      {loading && (
        <div className="max-w-lg mx-auto space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-card border border-border rounded-xl p-3 flex gap-3 animate-pulse"
            >
              <div className="w-20 h-20 rounded-lg bg-border flex-shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 bg-border rounded w-3/4" />
                <div className="h-3 bg-border rounded w-1/2" />
                <div className="h-3 bg-border rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── empty state ─────────────────────────────── */}
      {!loading && items.length === 0 && (
        <div className="max-w-lg mx-auto bg-card border border-border rounded-xl py-14 flex flex-col items-center gap-3 text-center px-6">
          <HiHeart className="w-10 h-10 text-border" />
          <div>
            <p className="text-white text-sm font-semibold">Your wishlist is empty</p>
            <p className="text-muted text-xs mt-1">
              Save items you love to find them easily later
            </p>
          </div>
          <Link
            to="/"
            className="mt-1 text-xs font-bold text-accent uppercase tracking-widest active:opacity-60 transition-opacity"
          >
            Explore NoorFit →
          </Link>
        </div>
      )}

      {/* ── list ────────────────────────────────────── */}
      {!loading && items.length > 0 && (
        <div className="max-w-lg mx-auto">
          {/* item count bar */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-muted text-xs">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* items — plain div stack, no overflow constraints */}
          <AnimatePresence initial={false}>
            {items.map((p, idx) => {
              const price = p.variants?.[0]?.price ?? p.price;
              const oldPrice = p.originalPrice ?? null;
              const discount = oldPrice
                ? Math.round(((oldPrice - price) / oldPrice) * 100)
                : null;
              const variant = getVariantLabel(p);
              const isMoving = moving === p._id;
              const isRemoving = removing === p._id;
              const busy = isMoving || isRemoving;

              return (
                <motion.div
                  key={p._id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: busy ? 0.45 : 1, y: 0 }}
                  exit={{ opacity: 0, x: -16, transition: { duration: 0.16 } }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1], delay: idx * 0.04 }}
                  /* 
                    margin-bottom instead of gap on parent —
                    so AnimatePresence exit doesn't leave phantom space
                  */
                  style={{ marginBottom: idx < items.length - 1 ? 10 : 0 }}
                  className="bg-card border border-border rounded-xl overflow-hidden flex"
                >
                  {/* image */}
                  <Link
                    to={`/products/${p._id}`}
                    className="flex-shrink-0 w-24 bg-primary overflow-hidden"
                    style={{ minHeight: 96 }}
                  >
                    {p.images?.[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        style={{ display: "block" }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl min-h-[96px]">
                        👕
                      </div>
                    )}
                  </Link>

                  {/* details */}
                  <div className="flex-1 min-w-0 p-3 flex flex-col justify-between gap-2">
                    {/* top: name + remove */}
                    <div className="flex items-start justify-between gap-2">
                      <Link to={`/products/${p._id}`} className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium leading-snug line-clamp-2">
                          {p.name}
                        </p>
                        {variant && (
                          <p className="text-muted text-xs mt-0.5">{variant}</p>
                        )}
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleRemove(p._id)}
                        disabled={busy}
                        className="flex-shrink-0 p-1.5 rounded-lg text-muted active:text-red-400 active:scale-90 transition-all disabled:opacity-40"
                        aria-label="Remove from wishlist"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>

                    {/* bottom: price + cta */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-accent font-bold text-sm">
                          ₹{price?.toFixed(2)}
                        </span>
                        {oldPrice && (
                          <span className="text-muted text-xs line-through">
                            ₹{oldPrice.toFixed(2)}
                          </span>
                        )}
                        {discount && (
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{
                              background: "rgba(166,198,85,.12)",
                              color: "#a6c655",
                            }}
                          >
                            {discount}% OFF
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleMoveToCart(p)}
                        disabled={busy}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-accent text-primary active:scale-95 transition-transform flex-shrink-0 disabled:opacity-50"
                      >
                        <HiShoppingCart className="w-3.5 h-3.5" />
                        {isMoving ? "Adding…" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}