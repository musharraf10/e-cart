import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/client.js";
import { clearCart } from "../store/slices/cartSlice.js";
import { Elements, CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutPageContent() {
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
  const [addressId, setAddressId] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

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
        setAddressId(defaultAddress._id || null);
      })
      .catch(() => { });
  }, []);

  const handlePlaceOrder = async () => {
    if (!items.length) return;
    setPlacing(true);
    setProcessingOrder(false);
    try {
      const orderItems = items.map((i) => ({
        product: i.product,
        qty: i.qty,
        size: i.size,
        color: i.color,
        sku: i.sku,
      }));

      if (paymentMethod === "online") {
        if (!stripe || !elements) {
          throw new Error("Stripe is not ready yet");
        }

        const card = elements.getElement(CardElement);
        if (!card) {
          throw new Error("Card element not found");
        }

        // Keep the saved address in sync so the webhook-created order uses
        // the same address the user edited in checkout.
        if (addressId) {
          const hasRequiredFields =
            address.line1 &&
            address.city &&
            address.state &&
            address.postalCode &&
            address.country;

          if (hasRequiredFields) {
            await api.put(`/users/addresses/${addressId}`, {
              addressLine1: address.line1,
              addressLine2: address.line2 || undefined,
              city: address.city,
              state: address.state,
              postalCode: address.postalCode,
              country: address.country,
            });
          }
        }

        const { data } = await api.post("/payments/create-payment-intent", {
          items: orderItems,
          totalAmount: subtotal,
          couponCode: couponCode || undefined,
          addressId: addressId || undefined,
        });

        const clientSecret = data?.clientSecret;
        if (!clientSecret) {
          throw new Error("Unable to create payment intent");
        }

        const paymentResult = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card },
        });

        if (paymentResult?.error) {
          throw new Error(paymentResult.error.message || "Payment failed");
        }

        const paymentIntent = paymentResult?.paymentIntent;
        if (!paymentIntent || paymentIntent.status !== "succeeded") {
          throw new Error("Payment not completed");
        }

        setProcessingOrder(true);

        // Webhook is the source of truth. Wait for the backend to confirm.
        const pollForOrder = async () => {
          const maxAttempts = 20;
          const delayMs = 1500;

          for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const { data } = await api.get(
              `/orders/verify-payment/${paymentIntent.id}`,
            );

            if (data?.exists && data?.order) return data.order;

            await new Promise((r) => setTimeout(r, delayMs));
          }

          throw new Error("Timed out waiting for order confirmation");
        };

        await pollForOrder();
      } else {
        await api.post("/orders", {
          items: orderItems,
          shippingAddress: address,
          paymentMethod,
          couponCode: couponCode || undefined,
        });
      }
      dispatch(clearCart());
      navigate("/account");
    } catch (err) {
      alert(err.response?.data?.message || "Unable to place order");
    } finally {
      setPlacing(false);
      setProcessingOrder(false);
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
              className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${paymentMethod === "online"
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-[#262626] text-muted hover:text-white"
                }`}
            >
              Online
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("cod")}
              className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${paymentMethod === "cod"
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

          {paymentMethod === "online" && (
            <div className="space-y-3">
              <div className="text-sm text-muted">Card payment via Stripe</div>
              <div className="rounded-xl border border-[#262626] bg-primary px-4 py-3">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: "14px",
                        color: "#ffffff",
                        "::placeholder": { color: "#a1a1aa" },
                      },
                      invalid: { color: "#ef4444" },
                    },
                  }}
                />
              </div>
            </div>
          )}
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
          disabled={
            placing ||
            !items.length ||
            (paymentMethod === "online" && (!stripe || !elements))
          }
          onClick={handlePlaceOrder}
          className="w-full rounded-xl bg-accent text-primary py-3 px-6 text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {placing
            ? processingOrder
              ? "Processing your order..."
              : "Placing order..."
            : "Place order"}
        </button>
      </aside>
    </motion.div>
  );
}

export function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutPageContent />
    </Elements>
  );
}
