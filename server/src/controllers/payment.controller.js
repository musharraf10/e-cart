import crypto from "crypto";
import { Order } from "../models/order.model.js";
import { razorpay } from "../utils/razorpay.js";
import {
  buildOrderPayload,
  deductStockForItems,
  markCouponUsed,
  resolveShippingAddress,
} from "../utils/checkout.util.js";

function createCheckoutFingerprint({ items, shippingAddress, couponCode }) {
  const itemKey = [...items]
    .sort((a, b) => String(a.product).localeCompare(String(b.product)))
    .map((item) => `${item.product}:${item.sku}:${item.size}:${item.color}:${item.qty}`)
    .join("|");

  const addressKey = [
    shippingAddress.line1,
    shippingAddress.line2 || "",
    shippingAddress.city,
    shippingAddress.state,
    shippingAddress.postalCode,
    shippingAddress.country,
  ].join("|");

  return crypto
    .createHash("sha256")
    .update(`${itemKey}#${addressKey}#${couponCode || ""}`)
    .digest("hex");
}

async function buildPendingOrderFromPayload(req, { items, address, coupon, addressId }) {
  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error("items are required when orderId is not provided");
    error.statusCode = 400;
    throw error;
  }

  const shippingAddress = await resolveShippingAddress({
    userId: req.user._id,
    shippingAddress: address,
    addressId,
  });

  const orderPayload = await buildOrderPayload({
    items,
    couponCode: coupon,
    shippingAddress,
  });

  const checkoutFingerprint = createCheckoutFingerprint(orderPayload);

  const existingOrder = await Order.findOne({
    user: req.user._id,
    paymentMethod: "online",
    checkoutFingerprint,
    status: "pending",
    paymentStatus: { $in: ["pending", "failed"] },
  }).sort({ createdAt: -1 });

  if (existingOrder) return existingOrder;

  return Order.create({
    user: req.user._id,
    ...orderPayload,
    paymentMethod: "online",
    paymentStatus: "pending",
    status: "pending",
    stockDeducted: false,
    couponApplied: false,
    checkoutFingerprint,
  });
}

async function deductStockForOrder(order) {
  if (order.stockDeducted) return true;

  const reserved = await deductStockForItems(order.items);
  if (!reserved) return false;

  order.stockDeducted = true;
  return true;
}

async function markOrderPaid(order, paymentId) {
  if (order.paymentStatus === "paid" && order.status === "confirmed") {
    return order;
  }

  const stockReserved = await deductStockForOrder(order);
  if (!stockReserved) {
    order.paymentStatus = "failed";
    order.status = "cancelled";
    order.paymentDetails = {
      provider: "razorpay",
      transactionId: paymentId,
    };
    await order.save();
    return order;
  }

  order.paymentStatus = "paid";
  order.status = "confirmed";
  order.razorpayPaymentId = paymentId;
  order.paymentDetails = {
    provider: "razorpay",
    transactionId: paymentId,
  };

  if (order.couponCode && !order.couponApplied) {
    await markCouponUsed(order.couponCode);
    order.couponApplied = true;
  }

  await order.save();
  return order;
}

export async function createRazorpayOrder(req, res) {
  if (!razorpay) {
    res.status(503);
    throw new Error("Razorpay is not configured");
  }

  const { orderId, items, address, coupon, addressId } = req.body;

  const order = orderId
    ? await Order.findOne({
      _id: orderId,
      user: req.user._id,
      paymentMethod: "online",
    })
    : await buildPendingOrderFromPayload(req, { items, address, coupon, addressId });

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.paymentStatus === "paid") {
    return res.json({
      orderId: order.razorpayOrderId,
      dbOrderId: order._id,
      amount: order.total,
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID,
      alreadyPaid: true,
    });
  }

  const amountInPaise = Math.round(Number(order.total) * 100);
  if (amountInPaise <= 0) {
    res.status(400);
    throw new Error("Order total must be greater than zero");
  }

  const razorpayOrder = await razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: String(order._id),
    notes: {
      orderId: String(order._id),
      userId: String(req.user._id),
    },
  });

  order.razorpayOrderId = razorpayOrder.id;
  order.paymentStatus = "pending";
  order.status = "pending";
  order.paymentDetails = {
    provider: "razorpay",
    transactionId: razorpayOrder.id,
  };
  await order.save();

  return res.status(201).json({
    orderId: razorpayOrder.id,
    dbOrderId: order._id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    key: process.env.RAZORPAY_KEY_ID,
  });
}

export async function verifyRazorpayPayment(req, res) {
  const {
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: razorpaySignature,
    orderId,
  } = req.body;

  if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    res.status(400);
    throw new Error("Missing payment verification fields");
  }

  const order = await Order.findOne({ _id: orderId, user: req.user._id, paymentMethod: "online" });
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (generatedSignature !== razorpaySignature) {
    order.paymentStatus = "failed";
    order.status = "pending";
    order.razorpayOrderId = razorpayOrderId;
    order.razorpayPaymentId = razorpayPaymentId;
    order.paymentDetails = {
      provider: "razorpay",
      transactionId: razorpayPaymentId,
    };
    await order.save();

    return res.status(400).json({
      verified: false,
      message: "Payment verification failed",
      orderId: order._id,
      paymentStatus: order.paymentStatus,
    });
  }

  order.razorpayOrderId = razorpayOrderId;
  await markOrderPaid(order, razorpayPaymentId);

  return res.json({
    verified: true,
    message: "Payment verified",
    orderId: order._id,
    paymentStatus: order.paymentStatus,
    status: order.status,
  });
}
