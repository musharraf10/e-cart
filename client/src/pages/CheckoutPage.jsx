import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { clearCart } from "../store/slices/cartSlice.js";

export function CheckoutPage() {
  const items = useSelector((s) => s.cart.items);
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [couponCode, setCouponCode] = useState("");
  const [address, setAddress] = useState({ line1: "", line2: "", city: "", state: "", postalCode: "", country: "" });
  const [placing, setPlacing] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  useEffect(() => {
    api.get("/users/addresses").then(({ data }) => {
      const defaultAddress = data.find((a) => a.isDefault);
      if (!defaultAddress) return;
      setAddress({ line1: defaultAddress.addressLine1 || "", line2: defaultAddress.addressLine2 || "", city: defaultAddress.city || "", state: defaultAddress.state || "", postalCode: defaultAddress.postalCode || "", country: defaultAddress.country || "" });
    }).catch(() => {});
  }, []);

  const handlePlaceOrder = async () => {
    if (!items.length) return;
    setPlacing(true);
    try {
      await api.post("/orders", {
        items: items.map((i) => ({ product: i.product, qty: i.qty, size: i.size, color: i.color })),
        shippingAddress: address,
        paymentMethod,
        couponCode: couponCode || undefined,
      });
      dispatch(clearCart());
      navigate("/account/orders");
    } catch (err) {
      alert(err.response?.data?.message || "Unable to place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-[2fr,1fr] gap-6">
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Checkout</h1>

        <div className="lux-card p-4 space-y-3">
          <h2 className="text-sm font-semibold">Shipping address</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <input placeholder="Address line 1" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} className="lux-input" />
            <input placeholder="Address line 2" value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} className="lux-input" />
            <input placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className="lux-input" />
            <input placeholder="State" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} className="lux-input" />
            <input placeholder="Postal code" value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} className="lux-input" />
            <input placeholder="Country" value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} className="lux-input" />
          </div>
        </div>

        <div className="lux-card p-4 space-y-3 text-sm">
          <h2 className="text-sm font-semibold">Payment</h2>
          <div className="flex gap-3">
            <button type="button" onClick={() => setPaymentMethod("online")} className={`px-3 py-2 rounded-xl border ${paymentMethod === "online" ? "border-accent text-accent" : "border-borderlux text-muted"}`}>Online</button>
            <button type="button" onClick={() => setPaymentMethod("cod")} className={`px-3 py-2 rounded-xl border ${paymentMethod === "cod" ? "border-accent text-accent" : "border-borderlux text-muted"}`}>Cash on delivery</button>
          </div>
          <input placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="lux-input" />
        </div>
      </section>

      <aside className="lux-card p-4 space-y-3 text-sm h-fit lg:sticky lg:top-24">
        <h2 className="text-sm font-semibold">Order summary</h2>
        <div className="flex items-center justify-between"><span className="text-muted">Subtotal</span><span className="font-medium">${subtotal.toFixed(2)}</span></div>
        <p className="text-[11px] text-muted">Discount, shipping, and taxes are estimated.</p>
        <button type="button" disabled={placing || !items.length} onClick={handlePlaceOrder} className="btn-primary w-full text-sm disabled:opacity-60">{placing ? "Placing order…" : "Place order"}</button>
      </aside>
    </div>
  );
}
