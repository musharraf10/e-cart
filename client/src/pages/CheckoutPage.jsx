import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useElements, useStripe } from "@stripe/react-stripe-js";

import api from "../api/client.js";
import { clearCart } from "../store/slices/cartSlice.js";
// import { useToast } from "@/components/ui/use-toast";  // ← uncomment when ready

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const cardElementOptions = {
  style: {
    base: {
      color: "#ffffff",
      fontSize: "14px",
      "::placeholder": { color: "#71717a" },
    },
    invalid: {
      color: "#f87171",
    },
  },
};

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

function isAddressValid(address) {
  return ["line1", "city", "state", "postalCode", "country"].every((field) =>
    String(address?.[field] || "").trim()
  );
}

function getCheckoutIssues(items, address) {
  const issues = [];

  if (!items.length) issues.push("Your cart is empty.");
  if (!isAddressValid(address)) issues.push("Add a complete shipping address.");

  items.forEach((item, index) => {
    if (!item.size || !item.color || !item.sku) {
      issues.push(`Select a valid variant for item ${index + 1}.`);
    }
    if (Number(item.qty || 0) <= 0) {
      issues.push(`Update the quantity for item ${index + 1}.`);
    }
    if (Number(item.stock ?? 1) <= 0) {
      issues.push(`${item.name || `Item ${index + 1}`} is out of stock.`);
    }
  });

  return [...new Set(issues)];
}

function Spinner({ label }) {
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
      <span>{label}</span>
    </div>
  );
}

function CheckoutForm() {
  const items = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const { toast } = useToast();     // ← uncomment when using shadcn toast

  const stripe = useStripe();
  const elements = useElements();

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
  const [processingStage, setProcessingStage] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [cardComplete, setCardComplete] = useState(false);

  const subtotal = items.reduce((sum, i) => sum + (i.price * i.qty), 0);
  const checkoutIssues = useMemo(() => getCheckoutIssues(items, address), [items, address]);

  const isProcessing =
    processingStage === "creating_intent" ||
    processingStage === "confirming_payment" ||
    processingStage === "creating_order";

  const canSubmit =
    checkoutIssues.length === 0 &&
    !isProcessing &&
    (paymentMethod !== "online" || (stripe && elements && cardComplete));

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
        setAddressId(defaultAddress._id || null);
      })
      .catch(() => { });
  }, []);

  const orderItems = useMemo(
    () =>
      items.map((item) => ({
        product: item.product,
        qty: item.qty,
        size: item.size,
        color: item.color,
        sku: item.sku,
      })),
    [items]
  );

  const handlePlaceOrder = async () => {
    if (!canSubmit) return;

    setErrorMessage("");
    setSuccessMessage("");
    setProcessingStage("processing");

    try {
      if (paymentMethod === "cod") {
        setProcessingStage("creating_order");
        const { data } = await api.post("/orders", {
          items: orderItems,
          shippingAddress: address,
          addressId: addressId || undefined,
          paymentMethod,
          couponCode: couponCode || undefined,
        });

        dispatch(clearCart());
        // toast?.({ title: "Order placed successfully." });
        navigate(`/success?orderId=${data.orderId}`);
        return;
      }

      // ── Online (Stripe) payment flow ───────────────────────────────
      const card = elements?.getElement(CardElement);
      if (!stripe || !card) {
        throw new Error("Stripe has not loaded yet.");
      }

      setProcessingStage("creating_intent");
      const { data: paymentData } = await api.post("/payments/create-payment-intent", {
        items: orderItems,
        shippingAddress: address,
        addressId: addressId || undefined,
        couponCode: couponCode || undefined,
      });

      if (!paymentData?.clientSecret) {
        throw new Error("Failed to create payment intent.");
      }

      setProcessingStage("confirming_payment");
      const { paymentIntent, error } = await stripe.confirmCardPayment(
        paymentData.clientSecret,
        { payment_method: { card } }
      );

      if (error) {
        throw new Error(error.message || "Payment failed");
      }

      if (!paymentIntent || paymentIntent.status !== "succeeded") {
        throw new Error("Payment did not complete successfully.");
      }

      setProcessingStage("creating_order");
      const { data: orderData } = await api.post("/orders", {
        items: orderItems,
        shippingAddress: address,
        addressId: addressId || undefined,
        paymentMethod: "online",
        couponCode: couponCode || undefined,
        paymentIntentId: paymentIntent.id,
      });

      dispatch(clearCart());
      setSuccessMessage("Payment successful! Redirecting to order status...");
      // toast?.({ title: "Payment successful", description: "Order is being processed." });

      // Redirect to order status / confirmation page
      setTimeout(() => {
        navigate(`/order-status/${paymentIntent.id}`);
      }, 1200);

    } catch (err) {
      const msg = getErrorMessage(err, "Unable to place order. Please try again.");
      setErrorMessage(msg);
      // toast?.({ variant: "destructive", title: "Error", description: msg });
      console.error("Checkout error:", err);
    } finally {
      setProcessingStage("idle");
    }
  };

  const actionLabel = isProcessing
    ? "Processing..."
    : paymentMethod === "online"
      ? "Pay & Place Order"
      : "Place Order (COD)";

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

        {/* Shipping Address */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Shipping address</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              ["line1", "Address line 1", "sm:col-span-2"],
              ["line2", "Address line 2 (optional)", "sm:col-span-2"],
              ["city", "City"],
              ["state", "State"],
              ["postalCode", "Postal code"],
              ["country", "Country"],
            ].map(([field, placeholder, extraClass]) => (
              <input
                key={field}
                placeholder={placeholder}
                value={address[field]}
                onChange={(e) => {
                  setAddress((prev) => ({ ...prev, [field]: e.target.value }));
                  if (addressId) setAddressId(null);
                }}
                disabled={isProcessing}
                className={`rounded-xl border border-border bg-primary px-4 py-3 text-sm text-white placeholder-muted-foreground focus:border-accent focus:outline-none disabled:opacity-60 ${extraClass || ""}`}
              />
            ))}
          </div>
        </div>

        {/* Payment + Coupon */}
        <div className="rounded-xl bg-card border border-border p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">Payment method</h2>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod("online")}
              disabled={isProcessing}
              className={`rounded-xl border px-5 py-2.5 text-sm font-medium transition-all disabled:opacity-60 ${paymentMethod === "online"
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted-foreground hover:text-white hover:border-muted"
                }`}
            >
              Online (Card)
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod("cod")}
              disabled={isProcessing}
              className={`rounded-xl border px-5 py-2.5 text-sm font-medium transition-all disabled:opacity-60 ${paymentMethod === "cod"
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted-foreground hover:text-white hover:border-muted"
                }`}
            >
              Cash on Delivery
            </button>
          </div>

          <input
            placeholder="Coupon code (optional)"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.trim())}
            disabled={isProcessing}
            className="w-full rounded-xl border border-border bg-primary px-4 py-2.5 text-sm text-white placeholder-muted-foreground focus:border-accent focus:outline-none disabled:opacity-60"
          />

          {paymentMethod === "online" && (
            <div className="space-y-3 rounded-xl border border-border bg-primary/50 p-4">
              <p className="text-sm text-muted-foreground">Pay securely with Stripe</p>
              <div className="rounded-xl border border-border bg-card px-4 py-3">
                <CardElement
                  options={cardElementOptions}
                  onChange={(e) => {
                    setCardComplete(e.complete);
                    setErrorMessage(e.error?.message || "");
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Order Summary Sidebar */}
      <aside className="rounded-xl bg-card border border-border p-6 h-fit md:sticky md:top-24 space-y-5">
        <h2 className="text-lg font-semibold text-white">Order summary</h2>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">₹{subtotal.toFixed(2)}</span>
        </div>

        <p className="text-xs text-muted-foreground">
          Taxes, shipping & discounts calculated on next step
        </p>

        {isProcessing && (
          <div className="rounded-xl border border-accent/20 bg-accent/5 p-3">
            <Spinner
              label={
                processingStage === "creating_order"
                  ? "Creating your order..."
                  : processingStage === "confirming_payment"
                    ? "Confirming payment..."
                    : "Processing..."
              }
            />
          </div>
        )}

        {successMessage && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 text-sm text-emerald-300">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        {checkoutIssues.length > 0 && (
          <ul className="space-y-1.5 rounded-xl border border-border bg-primary/60 p-4 text-xs text-muted-foreground">
            {checkoutIssues.map((issue) => (
              <li key={issue}>• {issue}</li>
            ))}
          </ul>
        )}

        <button
          type="button"
          disabled={!canSubmit}
          onClick={handlePlaceOrder}
          className="w-full rounded-xl bg-accent text-primary py-3 px-6 text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {actionLabel}
        </button>
      </aside>
    </motion.div>
  );
}

export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}