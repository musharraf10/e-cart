import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { clearCart } from "../store/slices/cartSlice.js";

export function CheckoutPage() {
  const items = useSelector((s) => s.cart.items);
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [couponCode, setCouponCode] = useState("");
  const [address, setAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  const [placing, setPlacing] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);


  useEffect(() => {
    api.get("/users/addresses")
      .then(({ data }) => {
        const defaultAddress = data.find((a) => a.isDefault);
        if (!defaultAddress) return;
        setAddress({
          line1: defaultAddress.addressLine1 || "",
          line2: defaultAddress.addressLine2 || "",
          city: defaultAddress.city || "",
          state: defaultAddress.state || "",
          postalCode: defaultAddress.postalCode || "",
          country: defaultAddress.country || "",
        });
      })
      .catch(() => {});
  }, []);

  const handlePlaceOrder = async () => {
    if (!items.length) return;
    setPlacing(true);
    try {
      await api.post("/orders", {
        items: items.map((i) => ({
          product: i.product,
          qty: i.qty,
          size: i.size,
          color: i.color,
        })),
        shippingAddress: address,
        paymentMethod,
        couponCode: couponCode || undefined,
      });
      dispatch(clearCart());
      navigate("/account");
    } catch (err) {
      alert(err.response?.data?.message || "Unable to place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="grid md:grid-cols-[2fr,1fr] gap-6">
      <section className="space-y-4">
        <h1 className="text-xl font-semibold">Checkout</h1>
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold">Shipping address</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <input
              placeholder="Address line 1"
              value={address.line1}
              onChange={(e) => setAddress({ ...address, line1: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
            <input
              placeholder="Address line 2"
              value={address.line2}
              onChange={(e) => setAddress({ ...address, line2: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
            <input
              placeholder="City"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
            <input
              placeholder="State"
              value={address.state}
              onChange={(e) => setAddress({ ...address, state: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
            <input
              placeholder="Postal code"
              value={address.postalCode}
              onChange={(e) =>
                setAddress({ ...address, postalCode: e.target.value })
              }
              className="border rounded-lg px-3 py-2"
            />
            <input
              placeholder="Country"
              value={address.country}
              onChange={(e) => setAddress({ ...address, country: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3 text-sm">
          <h2 className="text-sm font-semibold">Payment</h2>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod("online")}
              className={`px-3 py-1 rounded-full border ${
                paymentMethod === "online"
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-300"
              }`}
            >
              Online
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("cod")}
              className={`px-3 py-1 rounded-full border ${
                paymentMethod === "cod"
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-300"
              }`}
            >
              Cash on delivery
            </button>
          </div>
          <div className="flex gap-2 mt-2">
            <input
              placeholder="Coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2"
            />
          </div>
        </div>
      </section>

      <aside className="bg-white rounded-xl p-4 shadow-sm space-y-3 text-sm">
        <h2 className="text-sm font-semibold">Order summary</h2>
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        <p className="text-[11px] text-gray-500">
          Discount, shipping, and taxes are estimated. Final amounts appear on your
          confirmation.
        </p>
        <button
          type="button"
          disabled={placing || !items.length}
          onClick={handlePlaceOrder}
          className="w-full rounded-full bg-gray-900 text-white text-sm font-semibold py-2 disabled:opacity-60"
        >
          {placing ? "Placing order…" : "Place order"}
        </button>
      </aside>
    </div>
  );
}

