import { Order } from "../models/order.model.js";
import { stripe } from "../utils/stripe.js";
import {
  buildOrderPayload,
  deductStockForItems,
  markCouponUsed,
  resolveShippingAddress,
} from "../utils/checkout.util.js";

export async function createOrder(req, res) {
  const {
    items,
    shippingAddress,
    paymentMethod = "online",
    couponCode,
    addressId,
    paymentIntentId,
  } = req.body;

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

  if (paymentMethod === "online") {
    if (!stripe) {
      res.status(503);
      throw new Error("Stripe is not configured");
    }

    if (!paymentIntentId) {
      res.status(400);
      throw new Error("Payment intent is required");
    }

    const existingOrder = await Order.findOne({
      stripePaymentId: paymentIntentId,
      user: req.user._id,
    });
    if (existingOrder) {
      return res.status(200).json({ orderId: existingOrder._id, order: existingOrder });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const expectedAmount = Math.round(orderPayload.total * 100);

    if (paymentIntent.status !== "succeeded") {
      res.status(400);
      throw new Error("Payment has not succeeded");
    }

    if (paymentIntent.amount !== expectedAmount) {
      res.status(400);
      throw new Error("Payment amount mismatch");
    }

    if (String(paymentIntent.currency || "").toLowerCase() !== "inr") {
      res.status(400);
      throw new Error("Payment currency mismatch");
    }

    if (String(paymentIntent.metadata?.userId || "") !== String(req.user._id)) {
      res.status(403);
      throw new Error("Payment does not belong to this user");
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
      paymentStatus: "paid",
      status: "confirmed",
      stripePaymentId: paymentIntent.id,
      paymentDetails: {
        provider: "stripe",
        transactionId: paymentIntent.id,
      },
      stockDeducted: true,
      couponApplied: Boolean(orderPayload.couponCode),
    });

    await markCouponUsed(orderPayload.couponCode);

    return res.status(201).json({ orderId: order._id, order });
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

export async function verifyPayment(req, res) {
  const { paymentIntentId } = req.params;

  const order = await Order.findOne({
    stripePaymentId: paymentIntentId,
    user: req.user._id,
  }).sort({ createdAt: -1 });

  if (!order) {
    return res.json({ exists: false, status: "processing" });
  }

  return res.json({
    exists: true,
    status: order.paymentStatus,
    order,
  });
}
