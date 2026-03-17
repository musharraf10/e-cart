import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CartItem } from "../components/cart/CartItem.jsx";

export function CartPage() {
  const items = useSelector((s) => s.cart.items);
  const navigate = useNavigate();
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
          Cart
        </h1>
        <p className="text-muted text-sm mt-1">
          {items.length} {items.length === 1 ? "item" : "items"}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl bg-card border border-[#262626] p-12 text-center">
          <p className="text-muted">
            Your cart is empty.{" "}
            <Link to="/" className="text-accent font-medium hover:underline">
              Discover NoorFit pieces
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-[1fr,340px] gap-8">
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => (
                <CartItem key={`${item.product}-${index}`} item={item} index={index} />
              ))}
            </AnimatePresence>
          </div>
          <aside className="rounded-xl bg-card border border-[#262626] p-6 h-fit md:sticky md:top-24">
            <h2 className="text-lg font-semibold text-white mb-4">
              Order summary
            </h2>
            <div className="flex items-center justify-between text-sm mb-4">
              <span className="text-muted">Subtotal</span>
              <span className="font-semibold text-white">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <p className="text-muted text-xs mb-6">
              Taxes and shipping are calculated at checkout.
            </p>
            <button
              type="button"
              onClick={() => navigate("/checkout")}
              className="w-full rounded-xl bg-accent text-primary py-3 px-6 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Checkout
            </button>
          </aside>
        </div>
      )}
    </motion.div>
  );
}
