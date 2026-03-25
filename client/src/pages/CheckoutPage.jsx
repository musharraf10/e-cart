import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import api from "../api/client.js";
import { clearCart } from "../store/slices/cartSlice.js";

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

function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

async function openRazorpayCheckout({ paymentData, address, onFailed }) {
  return new Promise((resolve, reject) => {
    const razorpay = new window.Razorpay({
      key: paymentData.key,
      amount: paymentData.amount,
      currency: paymentData.currency,
      name: "NoorFit",
      description: "Order Payment",
      order_id: paymentData.orderId,
      prefill: {
        name: "NoorFit Customer",
      },
      notes: {
        address: `${address.line1}, ${address.city}`,
      },
      handler: (response) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error("Payment popup closed. You can continue payment later.")),
      },
    });

    razorpay.on("payment.failed", (response) => {
      onFailed?.(response?.error?.description || "Payment failed");
      reject(new Error(response?.error?.description || "Payment failed"));
    });

    razorpay.open();
  });
}

export default function CheckoutPage() {
  const items = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
  const [pendingOrderId, setPendingOrderId] = useState("");

  const subtotal = items.reduce((sum, i) => sum + (i.price * i.qty), 0);
  const checkoutIssues = useMemo(() => getCheckoutIssues(items, address), [items, address]);

  const isProcessing = processingStage !== "idle";

  const canSubmit = checkoutIssues.length === 0 && !isProcessing;

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
      .catch(() => {});
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

  const startOnlinePayment = async (orderIdOverride) => {
    setErrorMessage("");
    setSuccessMessage("");

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error("Unable to load Razorpay SDK. Please check your internet and try again.");
    }

    let dbOrderId = orderIdOverride;

    if (!dbOrderId) {
      setProcessingStage("creating_order");
      const { data: pendingData } = await api.post("/orders/create-pending", {
        items: orderItems,
        shippingAddress: address,
        addressId: addressId || undefined,
        paymentMethod: "online",
        couponCode: couponCode || undefined,
      });
      dbOrderId = pendingData.orderId;
      setPendingOrderId(dbOrderId);
    }

    setProcessingStage("creating_razorpay_order");
    const { data: paymentData } = await api.post("/payments/create-razorpay-order", {
      orderId: dbOrderId,
      items: orderItems,
      address,
      coupon: couponCode || undefined,
    });

    if (paymentData.alreadyPaid) {
      dispatch(clearCart());
      navigate(`/order-status/${dbOrderId}`);
      return;
    }

    setProcessingStage("processing_gateway");
    const response = await openRazorpayCheckout({
      paymentData,
      address,
      onFailed: (message) => {
        setPendingOrderId(dbOrderId);
        setErrorMessage(message || "Payment failed. Please retry.");
      },
    });

    setProcessingStage("verifying");
    const { data: verifyData } = await api.post("/payments/verify", {
      ...response,
      orderId: dbOrderId,
    });

    if (!verifyData.verified) {
      setPendingOrderId(dbOrderId);
      setErrorMessage("Payment failed verification. Continue payment to retry.");
      return;
    }

    dispatch(clearCart());
    setSuccessMessage("Order placed successfully.");
    navigate(`/order-status/${dbOrderId}`);
  };

  const handlePlaceOrder = async () => {
    if (!canSubmit) return;

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
        navigate(`/success?orderId=${data.orderId}`);
        return;
      }

      await startOnlinePayment();
    } catch (err) {
      const message = getErrorMessage(err, "Unable to place order. Please try again.");
      if (!pendingOrderId) {
        setErrorMessage(message);
      }
    } finally {
      setProcessingStage("idle");
    }
  };

  const actionLabel = isProcessing
    ? "Processing Payment..."
    : paymentMethod === "online"
      ? "Pay & Place Order"
      : "Place Order (COD)";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid gap-8 pb-28 md:grid-cols-[1fr,380px] md:pb-0"
    >
      <section className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Checkout</h1>

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

        <div className="space-y-5 rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-white">Payment method</h2>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod("online")}
              disabled={isProcessing}
              className={`rounded-xl border px-5 py-2.5 text-sm font-medium transition-all disabled:opacity-60 ${paymentMethod === "online"
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted-foreground hover:border-muted hover:text-white"
                }`}
            >
              Online (UPI / Card / Netbanking)
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod("cod")}
              disabled={isProcessing}
              className={`rounded-xl border px-5 py-2.5 text-sm font-medium transition-all disabled:opacity-60 ${paymentMethod === "cod"
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted-foreground hover:border-muted hover:text-white"
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
        </div>
      </section>

      <aside className="h-fit space-y-5 rounded-xl border border-border bg-card p-6 md:sticky md:top-24">
        <h2 className="text-lg font-semibold text-white">Order summary</h2>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">₹{subtotal.toFixed(2)}</span>
        </div>

        {isProcessing && (
          <div className="rounded-xl border border-accent/20 bg-accent/5 p-3">
            <Spinner label="Processing payment..." />
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

        {pendingOrderId && (
          <button
            type="button"
            onClick={() => navigate(`/checkout/resume/${pendingOrderId}`)}
            className="w-full rounded-xl border border-accent bg-accent/10 px-4 py-3 text-sm font-semibold text-accent"
          >
            Continue Payment
          </button>
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
          className="hidden w-full rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 md:block"
        >
          {actionLabel}
        </button>
      </aside>

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-card/95 p-4 backdrop-blur md:hidden">
        <button
          type="button"
          disabled={!canSubmit}
          onClick={handlePlaceOrder}
          className="w-full rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {actionLabel}
        </button>
      </div>
    </motion.div>
  );
}
