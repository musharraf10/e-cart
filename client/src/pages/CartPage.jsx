import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { removeFromCart, updateQty } from "../store/slices/cartSlice.js";

export function CartPage() {
  const items = useSelector((s) => s.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Cart</h1>
      {items.length === 0 ? (
        <div className="text-sm text-gray-500">
          Your cart is empty.{" "}
          <Link to="/" className="text-accent font-medium">
            Discover NoorFit pieces
          </Link>
          .
        </div>
      ) : (
        <div className="grid md:grid-cols-[2fr,1fr] gap-6">
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={`${item.product}-${index}`}
                className="flex gap-4 bg-white rounded-xl p-3 shadow-sm"
              >
                <div className="w-20 h-24 bg-gray-100 rounded-lg overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.size && <>Size {item.size}</>}{" "}
                      {item.color && (
                        <>
                          · <span>{item.color}</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <div className="flex items-center border rounded-full overflow-hidden text-xs">
                      <button
                        type="button"
                        onClick={() =>
                          dispatch(
                            updateQty({ index, qty: Math.max(1, item.qty - 1) }),
                          )
                        }
                        className="px-2 py-1"
                      >
                        −
                      </button>
                      <span className="px-3">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() =>
                          dispatch(updateQty({ index, qty: item.qty + 1 }))
                        }
                        className="px-2 py-1"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-semibold">
                      ${(item.price * item.qty).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => dispatch(removeFromCart(index))}
                      className="text-xs text-gray-500 hover:text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <aside className="bg-white rounded-xl p-4 shadow-sm space-y-3">
            <h2 className="text-sm font-semibold">Summary</h2>
            <div className="flex items-center justify-between text-sm">
              <span>Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <p className="text-[11px] text-gray-500">
              Taxes and shipping are calculated at checkout.
            </p>
            <button
              type="button"
              onClick={() => navigate("/checkout")}
              className="w-full rounded-full bg-gray-900 text-white text-sm font-semibold py-2"
            >
              Checkout
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}

