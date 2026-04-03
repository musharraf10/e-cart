import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { removeFromCart, updateQty } from "../../store/slices/cartSlice.js";

export function CartItem({ item, index, selected, onSelectChange }) {
  const dispatch = useDispatch();
  const lineTotal = item.price * item.qty;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex gap-4 p-4 rounded-xl bg-card border border-[#262626] hover:border-[#262626]/80 transition-all duration-200"
    >
      <div className="flex items-start pt-1">
        <input
          type="checkbox"
          checked={Boolean(selected)}
          onChange={(event) => onSelectChange?.(event.target.checked)}
          className="h-4 w-4 cursor-pointer rounded border-border bg-primary text-accent focus:ring-accent"
          aria-label={`Select ${item.name}`}
        />
      </div>
      <div className="w-20 h-24 md:w-24 md:h-28 flex-shrink-0 rounded-lg overflow-hidden bg-[#262626]">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-xs">
            NoorFit
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <p className="text-sm font-medium text-white line-clamp-2">{item.name}</p>
          <p className="text-xs text-muted mt-0.5">
            {item.size && <>Size {item.size}</>}
            {item.size && item.color && " · "}
            {item.color && <>{item.color}</>}
          </p>
        </div>
        <div className="flex items-center justify-between gap-3 mt-2 flex-wrap">
          <div className="flex items-center rounded-full border border-[#262626] overflow-hidden text-sm bg-primary">
            <button
              type="button"
              onClick={() =>
                dispatch(updateQty({ index, qty: Math.max(1, item.qty - 1) }))
              }
              className="px-3 py-1.5 text-muted hover:text-white transition-colors focus-ring"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="px-3 py-1.5 text-white min-w-[2rem] text-center">
              {item.qty}
            </span>
            <button
              type="button"
              onClick={() =>
                dispatch(updateQty({ index, qty: item.qty + 1 }))
              }
              className="px-3 py-1.5 text-muted hover:text-white transition-colors focus-ring"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <span className="text-white font-semibold">
            ₹ {lineTotal.toFixed(2)}
          </span>
          <button
            type="button"
            onClick={() => dispatch(removeFromCart(index))}
            className="text-xs text-muted hover:text-red-400 transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </motion.div>
  );
}
