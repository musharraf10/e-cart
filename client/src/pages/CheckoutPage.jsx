import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import api from "../api/client.js";
import { clearCart } from "../store/slices/cartSlice.js";
import { useToast } from "../components/ui/ToastProvider.jsx";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function getErrorMessage(error, fallback) {
  return error.response?.data?.message || error.message || fallback;
}

export function CheckoutPage() {
  const items = useSelector((state) => state.cart.items);
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
  const [addressId, setAddressId] = useState(null);
  const [placing, setPlacing] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notify } = useToast();

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.qty, 0),
    [items],
  );

  useEffect(() => {
    api
      .get("/users/addresses")
      .then(({ data }) => {
        const defaultAddress = data.find((entry) => entry.isDefault);
        if (!defaultAddress) return;

        setAddress({
          line1: defaultAddress.addressLine1 || "",
          line2: defaultAddress.addressLine2 || "",
          city: defaultAddress.city || "",
          state: defaultAddress.state || "",
          postalCode: defaultAddress.postalCode || "",
          country: defaultAddress.country || "",
        });
        setAddressId(defaultAddress._id || null);
      })
      .catch(() => {
        notify("Unable to load saved addresses.", "error");
      });
  }, [notify]);

  const handlePlaceOrder = async () => {
    if (!items.length || placing) return;

    setPlacing(true);
    try {
      const orderItems = items.map((item) => ({
        product: item.product,
        qty: item.qty,
        size: item.size,
        color: item.color,
        sku: item.sku,
      }));

      const { data } = await api.post("/orders", {
        items: orderItems,
        shippingAddress: address,
        addressId: addressId || undefined,
        paymentMethod,
        couponCode: couponCode || undefined,
      });

      if (paymentMethod === "cod") {
        dispatch(clearCart());
        notify("Order placed successfully.");
        navigate(`/success?orderId=${data.orderId}`);
        return;
      }

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe is not available right now.");
      }

      const sessionId = data?.stripeSessionId;
      if (!sessionId) {
        throw new Error("Unable to start Stripe checkout.");
      }

      dispatch(clearCart());
      const result = await stripe.redirectToCheckout({ sessionId });
      if (result.error) {
        throw new Error(result.error.message || "Unable to redirect to Stripe checkout.");
      }
    } catch (error) {
      notify(getErrorMessage(error, "Unable to place order."), "error");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid gap-8 md:grid-cols-[1fr,380px]"
    >
      <section className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Checkout
        </h1>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Shipping address</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              ["line1", "Address line 1", "sm:col-span-2"],
              ["line2", "Address line 2", "sm:col-span-2"],
              ["city", "City"],
              ["state", "State"],
              ["postalCode", "Postal code"],
              ["country", "Country"],
            ].map(([field, placeholder, extraClass]) => (
              <input
                key={field}
                placeholder={placeholder}
                value={address[field]}
                onChange={(event) => setAddress({ ...address, [field]: event.target.value })}
                className={`rounded-xl border border-border bg-primary px-4 py-3 text-sm text-white placeholder-muted focus:border-accent focus:outline-none ${extraClass || ""}`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-white">Payment</h2>
          <div className="flex gap-3">
            {[
              ["online", "Online"],
              ["cod", "Cash on delivery"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setPaymentMethod(value)}
                className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                  paymentMethod === value
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-muted hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <input
            placeholder="Coupon code"
            value={couponCode}
            onChange={(event) => setCouponCode(event.target.value)}
            className="w-full rounded-xl border border-border bg-primary px-4 py-2.5 text-sm text-white placeholder-muted focus:border-accent focus:outline-none"
          />
          {paymentMethod === "online" && (
            <p className="text-sm text-muted">
              You will be redirected to Stripe Checkout to complete payment securely.
            </p>
          )}
        </div>
      </section>

      <aside className="h-fit rounded-xl border border-border bg-card p-6 md:sticky md:top-24">
        <h2 className="mb-4 text-lg font-semibold text-white">Order summary</h2>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted">Subtotal</span>
          <span className="font-semibold text-white">${subtotal.toFixed(2)}</span>
        </div>
        <p className="mb-6 text-xs text-muted">
          Discount, shipping, and taxes are estimated. Final amounts appear on your order.
        </p>
        <button
          type="button"
          disabled={placing || !items.length}
          onClick={handlePlaceOrder}
          className="w-full rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {placing ? "Placing order..." : paymentMethod === "online" ? "Continue to payment" : "Place order"}
        </button>
      </aside>
    </motion.div>
  );
}
