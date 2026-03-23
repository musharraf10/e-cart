import { Order } from "../models/order.model.js";
import { stripe } from "../utils/stripe.js";
import {
  buildOrderPayload,
  deductStockForItems,
  markCouponUsed,
  resolveShippingAddress,
} from "../utils/checkout.util.js";

async function deductStockForOrder(order) {
  if (order.stockDeducted) return true;

  const reserved = await deductStockForItems(order.items);
  if (!reserved) return false;
  order.stockDeducted = true;
  return true;
}

async function markOrderPaid(order, paymentIntent) {
  if (order.paymentStatus === "paid" && order.status === "confirmed") {
    return order;
  }

  const stockReserved = await deductStockForOrder(order);
  if (!stockReserved) {
    order.paymentStatus = "failed";
    order.status = "cancelled";
    order.paymentDetails = {
      provider: "stripe",
      transactionId: paymentIntent.id,
    };
    await order.save();
    return order;
  }

  order.paymentStatus = "paid";
  order.status = "confirmed";
  order.stripePaymentId = paymentIntent.id;
  order.paymentDetails = {
    provider: "stripe",
    transactionId: paymentIntent.id,
  };

  if (order.couponCode && !order.couponApplied) {
    await markCouponUsed(order.couponCode);
    order.couponApplied = true;
  }

  await order.save();
  return order;
}

async function markOrderFailed(order, paymentReference) {
  if (order.paymentStatus === "paid") {
    return order;
  }

  order.paymentStatus = "failed";
  order.status = "cancelled";
  order.stripePaymentId = paymentReference || order.stripePaymentId;
  order.paymentDetails = {
    provider: "stripe",
    transactionId: paymentReference || order.paymentDetails?.transactionId,
  };
  await order.save();
  return order;
}

function assertWebhookPaymentMatchesOrder(order, paymentIntent) {
  const expectedAmount = Math.round(order.total * 100);
  const actualAmount = Number(paymentIntent.amount || 0);
  const actualCurrency = String(paymentIntent.currency || "").toLowerCase();
  const metadataUserId = String(paymentIntent.metadata?.userId || "");

  if (actualAmount !== expectedAmount) {
    throw new Error(`Payment amount mismatch for order ${order._id}`);
  }

  if (actualCurrency !== "inr") {
    throw new Error(`Payment currency mismatch for order ${order._id}`);
  }

  if (metadataUserId !== String(order.user)) {
    throw new Error(`Payment user mismatch for order ${order._id}`);
  }
}

export async function createPaymentIntent(req, res) {
  if (!stripe) {
    res.status(503);
    throw new Error("Stripe is not configured");
  }

  const { items, shippingAddress, couponCode, addressId } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error("No items");
  }

  const addressSnapshot = await resolveShippingAddress({
    userId: req.user._id,
    shippingAddress,
    addressId,
  });

  const orderPayload = await buildOrderPayload({
    items,
    couponCode,
    shippingAddress: addressSnapshot,
  });

  const amount = Math.round(orderPayload.total * 100);
  if (amount <= 0) {
    res.status(400);
    throw new Error("Order total must be greater than zero");
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "inr",
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: "never",
    },
    metadata: {
      userId: String(req.user._id),
      itemCount: String(orderPayload.items.length),
    },
  });

  return res.status(201).json({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    amount: orderPayload.total,
    currency: "inr",
  });
}

export async function handleStripeWebhook(req, res) {
  try {
    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error("Stripe webhook is not configured");
    }

    const event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    const object = event.data?.object;
    const paymentIntentId = object?.id || object?.payment_intent;

    if (!paymentIntentId) {
      return res.status(200).json({ received: true });
    }

    const order = await Order.findOne({ stripePaymentId: paymentIntentId }).sort({ createdAt: -1 });

    if (!order) {
      console.warn("Stripe webhook order not found", { paymentIntentId, type: event.type });
      return res.status(200).json({ received: true });
    }

    if (event.type === "payment_intent.succeeded") {
      assertWebhookPaymentMatchesOrder(order, object);
      await markOrderPaid(order, object);
    }

    if (event.type === "payment_intent.payment_failed") {
      await markOrderFailed(order, paymentIntentId);
    }
  } catch (error) {
    console.error("Stripe webhook error", error.message);
  }

  return res.status(200).json({ received: true });
}
