import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import api from "../api/client.js";
import { clearCart } from "../store/slices/cartSlice.js";
import { useToast } from "../components/ui/ToastProvider.jsx";

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
  return error.response?.data?.message || error.message || fallback;
}

function isAddressValid(address) {
  return ["line1", "city", "state", "postalCode", "country"].every((field) =>
    String(address?.[field] || "").trim(),
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

    if ((Number(item.qty) || 0) <= 0) {
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
    <div className="flex items-center gap-3 text-sm text-muted">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
      <span>{label}</span>
    </div>
  );
}

function CheckoutForm() {
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
  const [processingStage, setProcessingStage] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [cardComplete, setCardComplete] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notify } = useToast();
  const stripe = useStripe();
  const elements = useElements();

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.qty, 0),
    [items],
  );

  const checkoutIssues = useMemo(() => getCheckoutIssues(items, address), [address, items]);
  const isProcessing = processingStage === "creating_intent"
    || processingStage === "confirming_payment"
    || processingStage === "verifying_payment"
    || processingStage === "creating_order";
  const canSubmit = checkoutIssues.length === 0
    && !isProcessing
    && (paymentMethod !== "online" || (Boolean(stripe) && Boolean(elements) && cardComplete));

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

  const orderItems = useMemo(
    () =>
      items.map((item) => ({
        product: item.product,
        qty: item.qty,
        size: item.size,
        color: item.color,
        sku: item.sku,
      })),
    [items],
  );

  const handlePlaceOrder = async () => {
    if (!canSubmit) return;

    setErrorMessage("");
    setSuccessMessage("");

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
        notify("Order placed successfully.");
        navigate(`/success?orderId=${data.orderId}`);
        return;
      }

      const card = elements?.getElement(CardElement);
      if (!stripe || !card) {
        throw new Error("Stripe is not available right now.");
      }

      setProcessingStage("creating_intent");
      const { data: paymentData } = await api.post("/payments/create-payment-intent", {
        items: orderItems,
        shippingAddress: address,
        addressId: addressId || undefined,
        couponCode: couponCode || undefined,
      });

      if (!paymentData?.clientSecret) {
        throw new Error("Unable to start payment.");
      }

      setProcessingStage("confirming_payment");
      const { paymentIntent, error } = await stripe.confirmCardPayment(paymentData.clientSecret, {
        payment_method: {
          card,
        },
      });

      if (error) {
        throw new Error(error.message || "Payment failed");
      }

      if (!paymentIntent) {
        throw new Error("Payment could not be confirmed");
      }

      if (paymentIntent.status !== "succeeded") {
        setProcessingStage("verifying_payment");
        throw new Error("Payment is still being verified. Please wait and retry if needed.");
      }

      setProcessingStage("creating_order");
      const { data } = await api.post("/orders", {
        items: orderItems,
        shippingAddress: address,
        addressId: addressId || undefined,
        paymentMethod: "online",
        couponCode: couponCode || undefined,
        paymentIntentId: paymentIntent.id,
      });

      setSuccessMessage("Payment successful. Redirecting to your orders...");
      dispatch(clearCart());
      notify("Payment successful. Your order is confirmed.");
      window.setTimeout(() => {
        navigate(`/account/orders/${data.orderId}`);
      }, 800);
    } catch (error) {
      const message = getErrorMessage(error, "Unable to place order.");
      setProcessingStage("failed");
      setErrorMessage(message);
      notify(message, "error");
      return;
    }

    setProcessingStage("idle");
  };

  const actionLabel = isProcessing
    ? "Processing payment..."
    : paymentMethod === "online"
      ? "Place Order"
      : "Place order";

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
                onChange={(event) => {
                  setAddress((current) => ({ ...current, [field]: event.target.value }));
                  if (addressId) setAddressId(null);
                }}
                disabled={isProcessing}
                className={`rounded-xl border border-border bg-primary px-4 py-3 text-sm text-white placeholder-muted focus:border-accent focus:outline-none disabled:opacity-60 ${extraClass || ""}`}
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
                onClick={() => {
                  setPaymentMethod(value);
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                disabled={isProcessing}
                className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-60 ${
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
            disabled={isProcessing}
            className="w-full rounded-xl border border-border bg-primary px-4 py-2.5 text-sm text-white placeholder-muted focus:border-accent focus:outline-none disabled:opacity-60"
          />
          {paymentMethod === "online" && (
            <div className="space-y-3 rounded-xl border border-border bg-primary p-4">
              <p className="text-sm text-muted">Card payment via Stripe</p>
              <div className="rounded-xl border border-border bg-card px-4 py-3">
                <CardElement
                  options={cardElementOptions}
                  onChange={(event) => {
                    setCardComplete(Boolean(event.complete));
                    if (event.error?.message) {
                      setErrorMessage(event.error.message);
                    } else {
                      setErrorMessage("");
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      <aside className="h-fit rounded-xl border border-border bg-card p-6 md:sticky md:top-24">
        <h2 className="mb-4 text-lg font-semibold text-white">Order summary</h2>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted">Subtotal</span>
          <span className="font-semibold text-white">₹{subtotal.toFixed(2)}</span>
        </div>
        <p className="mb-4 text-xs text-muted">
          Final totals are recalculated securely on the server before payment and order creation.
        </p>

        {isProcessing && (
          <div className="mb-4 rounded-xl border border-accent/20 bg-accent/5 p-3">
            <Spinner
              label={
                processingStage === "creating_order"
                  ? "Creating your order..."
                  : processingStage === "verifying_payment"
                    ? "Verifying payment..."
                    : "Processing payment..."
              }
            />
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        {checkoutIssues.length > 0 && (
          <ul className="mb-4 space-y-2 rounded-xl border border-border bg-primary p-4 text-xs text-muted">
            {checkoutIssues.map((issue) => (
              <li key={issue}>• {issue}</li>
            ))}
          </ul>
        )}

        <button
          type="button"
          disabled={!canSubmit}
          onClick={handlePlaceOrder}
          className="w-full rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {actionLabel}
        </button>
      </aside>
    </motion.div>
  );
}

export function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
