import { Product } from "../models/product.model.js";
import { Coupon } from "../models/coupon.model.js";
import { Order } from "../models/order.model.js";
import { Address } from "../models/address.model.js";
import { stripe } from "../utils/stripe.js";

function findVariant(product, item) {
  return (product.variants || []).find(
    (v) => v.size === item.size && v.color === item.color,
  );
}

async function computeOrderTotal({ items, couponCode }) {
  const productIds = items.map((i) => i.product);
  const products = await Product.find({
    _id: { $in: productIds },
    isVisible: true,
  });
  const productMap = new Map(products.map((p) => [String(p._id), p]));

  let subtotal = 0;
  items.forEach((i) => {
    const p = productMap.get(String(i.product));
    if (!p) throw new Error("Product not found");
    const variant = findVariant(p, i);
    if (!variant) throw new Error(`Variant not found for ${p.name}`);
    if (variant.stock < i.qty) {
      throw new Error(
        `Insufficient stock for ${p.name} (${variant.size} / ${variant.color})`,
      );
    }
    subtotal += (Number(variant.price) || 0) * Number(i.qty);
  });

  let discount = 0;
  let appliedCouponCode;

  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: String(couponCode).toUpperCase(),
      active: true,
      expiry: { $gte: new Date() },
    });

    // For webhook verification, we recompute using the coupon's current DB value
    // and validate against the PaymentIntent amount. Avoid blocking order creation
    // due to concurrent coupon usage in the meantime.
    if (coupon && subtotal >= (coupon.minOrder || 0)) {
      if (coupon.discountType === "percentage") {
        discount = (subtotal * coupon.value) / 100;
      } else {
        discount = coupon.value;
      }
      appliedCouponCode = coupon.code;
    }
  }

  const total = subtotal - discount;
  return { subtotal, discount, total, appliedCouponCode };
}

export async function createPaymentIntent(req, res) {
  const { items, totalAmount, couponCode, addressId } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error("Items are required");
  }

  if (totalAmount != null) {
    const numericTotal = Number(totalAmount);
    if (!Number.isFinite(numericTotal) || numericTotal <= 0) {
      res.status(400);
      throw new Error("Invalid totalAmount");
    }
  }

  const { total, appliedCouponCode } = await computeOrderTotal({
    items,
    couponCode,
  });

  const rupees = Number(total);
  const amountPaise = Math.round(rupees * 100);
  if (!amountPaise || amountPaise <= 0) {
    res.status(400);
    throw new Error("Invalid payment amount");
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    res.status(500);
    throw new Error("Stripe not configured");
  }

  const cartItemsForMetadata = items.map((i) => ({
    product: String(i.product),
    qty: Number(i.qty),
    size: i.size,
    color: i.color,
  }));

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountPaise,
    currency: "inr",
    automatic_payment_methods: { enabled: true },
    metadata: {
      userId: String(req.user._id),
      cartItems: JSON.stringify(cartItemsForMetadata),
      addressId: addressId ? String(addressId) : "",
      couponCode: appliedCouponCode ? String(appliedCouponCode) : "",
    },
  });

  res.json({ clientSecret: paymentIntent.client_secret });
}

function safeJsonParse(value) {
  if (typeof value !== "string") return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

async function buildOrderItemsAndTotals({ items, couponCode }) {
  const productIds = items.map((i) => i.product);
  const products = await Product.find({
    _id: { $in: productIds },
    isVisible: true,
  });
  const productMap = new Map(products.map((p) => [String(p._id), p]));

  let subtotal = 0;
  const orderItems = items.map((i) => {
    const p = productMap.get(String(i.product));
    if (!p) throw new Error("Product not found");

    const variant = findVariant(p, i);
    if (!variant) throw new Error(`Variant not found for ${p.name}`);

    const qty = Number(i.qty);
    if (variant.stock < qty) {
      throw new Error(
        `Insufficient stock for ${p.name} (${variant.size} / ${variant.color})`,
      );
    }

    const price = Number(variant.price) || 0;
    subtotal += price * qty;

    return {
      product: p._id,
      name: p.name,
      image: p.images?.[0],
      price,
      qty,
      size: variant.size,
      color: variant.color,
      sku: variant.sku,
    };
  });

  let discount = 0;
  let appliedCouponCode;

  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: String(couponCode).toUpperCase(),
      active: true,
      expiry: { $gte: new Date() },
    });

    const isWithinUsageLimit =
      !coupon?.usageLimit || (coupon.usedCount || 0) < coupon.usageLimit;

    if (coupon && isWithinUsageLimit && subtotal >= (coupon.minOrder || 0)) {
      if (coupon.discountType === "percentage") {
        discount = (subtotal * coupon.value) / 100;
      } else {
        discount = coupon.value;
      }
      appliedCouponCode = coupon.code;
    }
  }

  const total = subtotal - discount;
  return { orderItems, subtotal, discount, total, appliedCouponCode };
}

export async function handleStripeWebhook(req, res) {
  try {
    if (!stripe) throw new Error("Stripe SDK not configured");

    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!endpointSecret) throw new Error("Missing STRIPE_WEBHOOK_SECRET");

    const event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      endpointSecret,
    );

    const paymentIntent = event.data?.object;
    if (paymentIntent?.id) {
      if (event.type === "payment_intent.succeeded") {
        const metadata = paymentIntent.metadata || {};
        const userId = metadata.userId;
        const addressId = metadata.addressId;
        const couponCode = metadata.couponCode || undefined;
        const cartItems = safeJsonParse(metadata.cartItems);

        if (!userId || !Array.isArray(cartItems)) {
          console.warn("Webhook missing required metadata", {
            paymentIntentId: paymentIntent.id,
          });
        } else {
          const {
            orderItems,
            subtotal,
            discount,
            total,
            appliedCouponCode,
          } = await buildOrderItemsAndTotals({
            items: cartItems,
            couponCode,
          });

          const expectedAmountPaise = Math.round(Number(total) * 100);
          if (
            paymentIntent.status !== "succeeded" ||
            paymentIntent.currency !== "inr" ||
            paymentIntent.amount !== expectedAmountPaise
          ) {
            console.warn("Webhook payment validation failed", {
              paymentIntentId: paymentIntent.id,
              expectedAmountPaise,
              receivedAmountPaise: paymentIntent.amount,
              currency: paymentIntent.currency,
            });
          } else {
            // Idempotency: avoid creating the order twice for the same payment.
            const existingOrder = await Order.findOne({
              stripePaymentId: paymentIntent.id,
            });
            if (!existingOrder) {
              const addressDoc = addressId
                ? await Address.findOne({ _id: addressId, userId })
                : null;

              // Deduct stock before order creation (matches existing createOrder behavior).
              for (const item of orderItems) {
                const updateResult = await Product.updateOne(
                  {
                    _id: item.product,
                    isVisible: true,
                    variants: {
                      $elemMatch: {
                        size: item.size,
                        color: item.color,
                        stock: { $gte: item.qty },
                      },
                    },
                  },
                  {
                    $inc: { "variants.$.stock": -item.qty },
                  },
                );

                if (updateResult.modifiedCount === 0) {
                  throw new Error(
                    `Insufficient stock for ${item.name} (${item.size} / ${item.color})`,
                  );
                }
              }

              await Order.create({
                user: userId,
                items: orderItems,
                shippingAddress: addressDoc
                  ? {
                      line1: addressDoc.addressLine1,
                      line2: addressDoc.addressLine2,
                      city: addressDoc.city,
                      state: addressDoc.state,
                      postalCode: addressDoc.postalCode,
                      country: addressDoc.country,
                    }
                  : undefined,
                paymentMethod: "online",
                paymentStatus: "paid",
                paymentDetails: {
                  provider: "stripe",
                  transactionId: paymentIntent.id,
                },
                stripePaymentId: paymentIntent.id,
                subtotal,
                discount,
                total,
                couponCode: appliedCouponCode,
                status: "confirmed",
              });

              if (appliedCouponCode) {
                await Coupon.updateOne(
                  { code: appliedCouponCode },
                  { $inc: { usedCount: 1 } },
                );
              }
            }
          }
        }
      }

      if (event.type === "payment_intent.payment_failed") {
        console.warn("Stripe payment failed", {
          paymentIntentId: paymentIntent.id,
          lastPaymentError: paymentIntent.last_payment_error,
        });
      }
    }
  } catch (err) {
    console.error("Stripe webhook error", err);
  }

  // Always acknowledge Stripe so it doesn't retry endlessly.
  res.status(200).send("Received");
}

