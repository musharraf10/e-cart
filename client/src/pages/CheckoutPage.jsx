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
  const isSavedCardFlow = paymentData.paymentChannel === "card";

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
        paymentChannel: paymentData.paymentChannel,
        savedCardTokenId: paymentData.savedCardTokenId || "",
      },
      method: isSavedCardFlow
        ? {
          card: true,
          upi: false,
          netbanking: false,
          wallet: false,
          paylater: false,
          emi: false,
        }
        : {
          card: false,
          upi: true,
          netbanking: false,
          wallet: false,
          paylater: false,
          emi: false,
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

  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [savedCards, setSavedCards] = useState([]);
  const [selectedSavedCardId, setSelectedSavedCardId] = useState("");
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

  const canSubmit = checkoutIssues.length === 0
    && !isProcessing
    && (paymentMethod !== "saved_card" || Boolean(selectedSavedCardId));

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

    api
      .get("/users/saved-cards")
      .then(({ data }) => {
        const cards = Array.isArray(data) ? data : [];
        setSavedCards(cards);
        if (cards.length) {
          setSelectedSavedCardId(cards[0].id);
        }
      })
      .catch(() => {
        setSavedCards([]);
      });
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
    const selectedSavedCard = savedCards.find((card) => card.id === selectedSavedCardId);
    const channel = paymentMethod === "saved_card" ? "card" : "upi";

    const { data: paymentData } = await api.post("/payments/create-razorpay-order", {
      orderId: dbOrderId,
      items: orderItems,
      address,
      coupon: couponCode || undefined,
      paymentChannel: channel,
      savedCardTokenId: selectedSavedCard?.tokenId,
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
    : paymentMethod === "cod"
      ? "Place Order (COD)"
      : paymentMethod === "saved_card"
        ? "Pay with Saved Card"
        : "Pay with UPI";
  const selectedSavedCard = savedCards.find((card) => card.id === selectedSavedCardId);

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

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setPaymentMethod("upi")}
              disabled={isProcessing}
              className={`w-full rounded-2xl border px-4 py-4 text-left transition-all disabled:opacity-60 ${paymentMethod === "upi"
                ? "border-accent bg-accent/10 text-accent shadow-[0_0_0_1px_rgba(190,242,100,0.5)]"
                : "border-border text-muted-foreground hover:border-muted hover:text-white"
                }`}
            >
              <p className="text-sm font-semibold">UPI</p>
              <p className="mt-1 text-xs text-muted-foreground">Recommended • Fast payment via Razorpay UPI</p>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod("saved_card")}
              disabled={isProcessing || savedCards.length === 0}
              className={`w-full rounded-2xl border px-4 py-4 text-left transition-all disabled:opacity-60 ${paymentMethod === "saved_card"
                ? "border-accent bg-accent/10 text-accent shadow-[0_0_0_1px_rgba(190,242,100,0.5)]"
                : "border-border text-muted-foreground hover:border-muted hover:text-white"
                }`}
            >
              <p className="text-sm font-semibold">Saved cards</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {savedCards.length ? `${savedCards.length} card${savedCards.length > 1 ? "s" : ""} available` : "No saved cards yet"}
              </p>
            </button>

            {savedCards.length > 0 && paymentMethod === "saved_card" && (
              <div className="space-y-2 rounded-2xl border border-border bg-primary/50 p-3">
                {savedCards.map((card) => {
                  const isSelected = selectedSavedCardId === card.id;

                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => setSelectedSavedCardId(card.id)}
                      disabled={isProcessing}
                      className={`w-full rounded-xl border p-3 text-left transition-all ${isSelected
                        ? "border-accent bg-accent/10"
                        : "border-border bg-card/80 hover:border-muted"
                        }`}
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold uppercase tracking-wide">{card.brand}</span>
                        <span className="text-xs text-muted-foreground">Exp {card.expiry}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">•••• •••• •••• {card.last4}</p>
                    </button>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              onClick={() => setPaymentMethod("cod")}
              disabled={isProcessing}
              className={`w-full rounded-2xl border px-4 py-4 text-left transition-all disabled:opacity-60 ${paymentMethod === "cod"
                ? "border-accent bg-accent/10 text-accent shadow-[0_0_0_1px_rgba(190,242,100,0.5)]"
                : "border-border text-muted-foreground hover:border-muted hover:text-white"
                }`}
            >
              <p className="text-sm font-semibold">Cash on Delivery</p>
              <p className="mt-1 text-xs text-muted-foreground">Pay after delivery confirmation</p>
            </button>
          </div>

          {paymentMethod !== "cod" && (
            <p className="rounded-xl border border-border bg-primary/60 px-3 py-2 text-xs text-muted-foreground">
              Razorpay securely processes {paymentMethod === "saved_card" && selectedSavedCard ? `${selectedSavedCard.brand} •••• ${selectedSavedCard.last4}` : "UPI"}. NoorFit never stores full card details.
            </p>
          )}

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
