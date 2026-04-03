import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CartItem } from "../components/cart/CartItem.jsx";

export function CartPage() {
  const items = useSelector((s) => s.cart.items);
  const navigate = useNavigate();
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    setSelectedItems((current) => current.filter((selectedIndex) => selectedIndex < items.length));
  }, [items.length]);

  const selectedSet = useMemo(() => new Set(selectedItems), [selectedItems]);
  const selectedCartItems = useMemo(
    () => selectedItems.map((index) => items[index]).filter(Boolean),
    [items, selectedItems],
  );
  const selectedSubtotal = selectedCartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const allSelected = items.length > 0 && selectedItems.length === items.length;

  const toggleSelectAll = (checked) => {
    setSelectedItems(checked ? items.map((_, index) => index) : []);
  };

  const handleCheckoutSelected = () => {
    if (!selectedCartItems.length) return;
    navigate("/checkout", {
      state: {
        selected: selectedCartItems,
      },
    });
  };

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
        {items.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(event) => toggleSelectAll(event.target.checked)}
                className="h-4 w-4 rounded border-border bg-primary text-accent focus:ring-accent"
              />
              Select All
            </label>
            <span className="text-xs rounded-full border border-[#303030] px-2.5 py-1 text-muted">
              {selectedItems.length} selected
            </span>
          </div>
        ) : null}
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
                <CartItem
                  key={`${item.product}-${index}`}
                  item={item}
                  index={index}
                  selected={selectedSet.has(index)}
                  onSelectChange={(checked) => {
                    setSelectedItems((current) => {
                      if (checked) return [...new Set([...current, index])];
                      return current.filter((entry) => entry !== index);
                    });
                  }}
                />
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
                ₹{subtotal.toFixed(2)}
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
      {items.length > 0 ? (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#262626] bg-primary/95 backdrop-blur md:hidden">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <div className="text-sm">
              <p className="text-muted">{selectedItems.length} selected</p>
              <p className="font-semibold text-white">₹{selectedSubtotal.toFixed(2)}</p>
            </div>
            <button
              type="button"
              disabled={selectedItems.length === 0}
              onClick={handleCheckoutSelected}
              className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Checkout Selected
            </button>
          </div>
        </div>
      ) : null}
      {items.length > 0 ? (
        <div className="hidden md:fixed md:bottom-0 md:left-0 md:right-0 md:z-20 md:block">
          <div className="mx-auto mb-4 flex w-full max-w-6xl items-center justify-between rounded-xl border border-[#262626] bg-primary/95 px-5 py-3 backdrop-blur">
            <p className="text-sm text-muted">
              <span className="font-semibold text-white">{selectedItems.length}</span> items selected
            </p>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-white">₹{selectedSubtotal.toFixed(2)}</span>
              <button
                type="button"
                disabled={selectedItems.length === 0}
                onClick={handleCheckoutSelected}
                className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Checkout Selected
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}
