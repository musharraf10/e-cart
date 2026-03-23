import { Order } from "../models/order.model.js";
import { stripe } from "../utils/stripe.js";
import {
  buildOrderPayload,
  deductStockForItems,
  markCouponUsed,
  resolveShippingAddress,
} from "../utils/checkout.util.js";

const WEBHOOK_PENDING_GRACE_MS = 2 * 60 * 1000;
const STRIPE_FAILURE_STATUSES = new Set(["canceled", "requires_payment_method"]);

async function buildValidatedOrderPayload({ userId, items, shippingAddress, addressId, couponCode }) {
  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error("No items");
    error.statusCode = 400;
    throw error;
  }

  const addressSnapshot = await resolveShippingAddress({
    userId,
    shippingAddress,
    addressId,
  });

  return buildOrderPayload({
    items,
    couponCode,
    shippingAddress: addressSnapshot,
  });
}

function buildOrderStatusResponse(order, extra = {}) {
  return {
    exists: true,
    paymentIntentId: order.stripePaymentId,
    orderId: order._id,
    orderStatus: order.status,
    paymentStatus: order.paymentStatus,
    isFinal: ["confirmed", "cancelled"].includes(order.status),
    order,
    ...extra,
  };
}

async function reconcilePendingOrderStatus(order) {
  if (!stripe || order.paymentMethod !== "online" || order.paymentStatus !== "pending") {
    return buildOrderStatusResponse(order);
  }

  const ageMs = Date.now() - new Date(order.createdAt).getTime();
  const isDelayed = ageMs >= WEBHOOK_PENDING_GRACE_MS;

  if (!isDelayed) {
    return buildOrderStatusResponse(order, {
      webhookDelayed: false,
      verificationState: "pending_webhook",
    });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(order.stripePaymentId);
    const stripeStatus = String(paymentIntent.status || "").toLowerCase();

    if (STRIPE_FAILURE_STATUSES.has(stripeStatus)) {
      order.paymentStatus = "failed";
      order.status = "cancelled";
      order.paymentDetails = {
        provider: "stripe",
        transactionId: paymentIntent.id,
      };
      await order.save();

      return buildOrderStatusResponse(order, {
        webhookDelayed: true,
        verificationState: "failed_in_stripe",
        stripeStatus,
      });
    }

    return buildOrderStatusResponse(order, {
      webhookDelayed: true,
      verificationState:
        stripeStatus === "succeeded" ? "awaiting_webhook_confirmation" : "pending_webhook",
      stripeStatus,
    });
  } catch {
    return buildOrderStatusResponse(order, {
      webhookDelayed: true,
      verificationState: "pending_webhook",
      verificationWarning: "Unable to reach Stripe while checking delayed payment status.",
    });
  }
}

async function validateStripePaymentIntent({ paymentIntentId, expectedAmount, userId }) {
  if (!stripe) {
    const error = new Error("Stripe is not configured");
    error.statusCode = 503;
    throw error;
  }

  if (!paymentIntentId) {
    const error = new Error("Payment intent is required");
    error.statusCode = 400;
    throw error;
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (!["succeeded", "processing", "requires_capture"].includes(paymentIntent.status)) {
    const error = new Error("Payment intent is not ready for order verification");
    error.statusCode = 400;
    throw error;
  }

  if (paymentIntent.amount !== expectedAmount) {
    const error = new Error("Payment amount mismatch");
    error.statusCode = 400;
    throw error;
  }

  if (String(paymentIntent.currency || "").toLowerCase() !== "inr") {
    const error = new Error("Payment currency mismatch");
    error.statusCode = 400;
    throw error;
  }

  if (String(paymentIntent.metadata?.userId || "") !== String(userId)) {
    const error = new Error("Payment does not belong to this user");
    error.statusCode = 403;
    throw error;
  }

  return paymentIntent;
}

export async function createOrder(req, res) {
  const {
    items,
    shippingAddress,
    paymentMethod = "online",
    couponCode,
    addressId,
  } = req.body;

  const orderPayload = await buildValidatedOrderPayload({
    userId: req.user._id,
    items,
    shippingAddress,
    addressId,
    couponCode,
  });

  if (paymentMethod === "online") {
    res.status(400);
    throw new Error("Online payments must use the pending order flow");
  }

  const stockReserved = await deductStockForItems(orderPayload.items);
  if (!stockReserved) {
    res.status(409);
    throw new Error("Some items are no longer available");
  }

  const order = await Order.create({
    user: req.user._id,
    ...orderPayload,
    paymentMethod,
    paymentStatus: "pending",
    status: "processing",
    stockDeducted: true,
    couponApplied: Boolean(orderPayload.couponCode),
  });

  await markCouponUsed(orderPayload.couponCode);

  return res.status(201).json({ orderId: order._id, order });
}

export async function createPendingOrder(req, res) {
  const {
    items,
    shippingAddress,
    paymentMethod = "online",
    couponCode,
    addressId,
    paymentIntentId,
  } = req.body;

  if (paymentMethod !== "online") {
    res.status(400);
    throw new Error("Pending orders are only supported for online payments");
  }

  const orderPayload = await buildValidatedOrderPayload({
    userId: req.user._id,
    items,
    shippingAddress,
    addressId,
    couponCode,
  });

  const paymentIntent = await validateStripePaymentIntent({
    paymentIntentId,
    expectedAmount: Math.round(orderPayload.total * 100),
    userId: req.user._id,
  });

  const existingOrder = await Order.findOne({
    stripePaymentId: paymentIntent.id,
    user: req.user._id,
  }).sort({ createdAt: -1 });

  if (existingOrder) {
    return res.status(existingOrder.status === "pending" ? 201 : 200).json({
      orderId: existingOrder._id,
      paymentIntentId: existingOrder.stripePaymentId,
      order: existingOrder,
    });
  }

  const order = await Order.create({
    user: req.user._id,
    ...orderPayload,
    paymentMethod: "online",
    paymentStatus: "pending",
    status: "pending",
    stripePaymentId: paymentIntent.id,
    paymentDetails: {
      provider: "stripe",
      transactionId: paymentIntent.id,
    },
    stockDeducted: false,
    couponApplied: false,
  });

  return res.status(201).json({
    orderId: order._id,
    paymentIntentId: paymentIntent.id,
    order,
  });
}

export async function listMyOrders(req, res) {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
}

export async function getOrderById(req, res) {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  res.json(order);
}

export async function getOrderByPaymentIntent(req, res) {
  const { paymentIntentId } = req.params;

  const order = await Order.findOne({
    stripePaymentId: paymentIntentId,
    user: req.user._id,
  }).sort({ createdAt: -1 });

  if (!order) {
    return res.status(404).json({
      exists: false,
      paymentIntentId,
      orderStatus: "missing",
      paymentStatus: "pending",
    });
  }

  const response = await reconcilePendingOrderStatus(order);
  return res.json({
    ...response,
    paymentIntentId,
  });
}

export async function verifyPayment(req, res) {
  return getOrderByPaymentIntent(req, res);
}
