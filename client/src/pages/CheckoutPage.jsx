import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
    api
      .get("/users/addresses")
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
          sku: i.sku,
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid md:grid-cols-[1fr,380px] gap-8"
    >
      <section className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
          Checkout
        </h1>

        <div className="rounded-xl bg-card border border-[#262626] p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Shipping address
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              placeholder="Address line 1"
              value={address.line1}
              onChange={(e) => setAddress({ ...address, line1: e.target.value })}
              className="rounded-xl border border-[#262626] bg-primary px-4 py-3 text-white text-sm placeholder-muted focus:outline-none focus:border-accent sm:col-span-2"
            />
            <input
              placeholder="Address line 2"
              value={address.line2}
              onChange={(e) => setAddress({ ...address, line2: e.target.value })}
              className="rounded-xl border border-[#262626] bg-primary px-4 py-3 text-white text-sm placeholder-muted focus:outline-none focus:border-accent sm:col-span-2"
            />
            <input
              placeholder="City"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
              className="rounded-xl border border-[#262626] bg-primary px-4 py-3 text-white text-sm placeholder-muted focus:outline-none focus:border-accent"
            />
            <input
              placeholder="State"
              value={address.state}
              onChange={(e) => setAddress({ ...address, state: e.target.value })}
              className="rounded-xl border border-[#262626] bg-primary px-4 py-3 text-white text-sm placeholder-muted focus:outline-none focus:border-accent"
            />
            <input
              placeholder="Postal code"
              value={address.postalCode}
              onChange={(e) =>
                setAddress({ ...address, postalCode: e.target.value })
              }
              className="rounded-xl border border-[#262626] bg-primary px-4 py-3 text-white text-sm placeholder-muted focus:outline-none focus:border-accent"
            />
            <input
              placeholder="Country"
              value={address.country}
              onChange={(e) =>
                setAddress({ ...address, country: e.target.value })
              }
              className="rounded-xl border border-[#262626] bg-primary px-4 py-3 text-white text-sm placeholder-muted focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="rounded-xl bg-card border border-[#262626] p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Payment</h2>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod("online")}
              className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                paymentMethod === "online"
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-[#262626] text-muted hover:text-white"
              }`}
            >
              Online
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("cod")}
              className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                paymentMethod === "cod"
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-[#262626] text-muted hover:text-white"
              }`}
            >
              Cash on delivery
            </button>
          </div>
          <div>
            <input
              placeholder="Coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="w-full rounded-xl border border-[#262626] bg-primary px-4 py-2.5 text-white text-sm placeholder-muted focus:outline-none focus:border-accent"
            />
          </div>
        </div>
      </section>

      <aside className="rounded-xl bg-card border border-[#262626] p-6 h-fit md:sticky md:top-24">
        <h2 className="text-lg font-semibold text-white mb-4">
          Order summary
        </h2>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted">Subtotal</span>
          <span className="font-semibold text-white">
            ${subtotal.toFixed(2)}
          </span>
        </div>
        <p className="text-muted text-xs mb-6">
          Discount, shipping, and taxes are estimated. Final amounts appear on
          your confirmation.
        </p>
        <button
          type="button"
          disabled={placing || !items.length}
          onClick={handlePlaceOrder}
          className="w-full rounded-xl bg-accent text-primary py-3 px-6 text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {placing ? "Placing order…" : "Place order"}
        </button>
      </aside>
    </motion.div>
  );
}
