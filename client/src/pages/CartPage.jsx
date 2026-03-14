import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { removeFromCart, updateQty } from "../store/slices/cartSlice.js";

export function CartPage() {
  const items = useSelector((s) => s.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Cart</h1>
      {items.length === 0 ? (
        <div className="lux-card p-6 text-sm text-muted">
          Your cart is empty. <Link to="/" className="text-accent font-medium">Discover NoorFit pieces</Link>.
        </div>
      ) : (
        <div className="grid lg:grid-cols-[2fr,1fr] gap-6">
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={`${item.product}-${index}`} className="lux-card p-3 md:p-4 flex gap-3">
                <div className="w-20 h-24 bg-[#111111] rounded-xl overflow-hidden">
                  {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" /> : null}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted">{item.size && <>Size {item.size}</>} {item.color && <>· {item.color}</>}</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm mt-2">
                    <div className="flex items-center border border-borderlux rounded-full overflow-hidden text-xs">
                      <button type="button" onClick={() => dispatch(updateQty({ index, qty: Math.max(1, item.qty - 1) }))} className="px-2 py-1">−</button>
                      <span className="px-3">{item.qty}</span>
                      <button type="button" onClick={() => dispatch(updateQty({ index, qty: item.qty + 1 }))} className="px-2 py-1">+</button>
                    </div>
                    <span className="font-semibold">${(item.price * item.qty).toFixed(2)}</span>
                    <button type="button" onClick={() => dispatch(removeFromCart(index))} className="text-xs text-red-400">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="lux-card p-4 space-y-3 lg:sticky lg:top-24 h-fit">
            <h2 className="text-sm font-semibold">Order Summary</h2>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <p className="text-[11px] text-muted">Taxes and shipping are calculated at checkout.</p>
            <button type="button" onClick={() => navigate("/checkout")} className="btn-primary w-full text-sm">Checkout</button>
          </aside>
        </div>
      )}
    </div>
  );
}
