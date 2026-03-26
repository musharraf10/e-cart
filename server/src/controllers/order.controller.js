import crypto from "crypto";
import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import { sendEmail } from "../utils/email.util.js";
import { createNotification } from "../services/notification.service.js";
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


async function sendOrderConfirmation(order) {
  const user = await User.findById(order.user).select("name email");
  if (!user?.email) return;

  await sendEmail({
    to: user.email,
    subject: `Order Confirmation #${order._id.toString().slice(-6)}`,
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Thanks for your order, ${user.name || "Customer"}!</h2>
        <p>Your order <strong>#${order._id.toString().slice(-6)}</strong> has been placed.</p>
        <p>Total: ₹${Number(order.total || 0).toFixed(2)}</p>
      </div>
    `,
  });
}

async function buildValidatedOrderPayload({
  userId,
  items,
  shippingAddress,
  addressId,
  couponCode,
}) {
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

  await Promise.allSettled([
    createNotification({
      userId: req.user._id,
      title: "Order placed",
      message: `Your order #${order._id.toString().slice(-6)} has been placed successfully.`,
      type: "order",
      link: `/account/orders/${order._id}`,
    }),
    sendOrderConfirmation(order),
  ]);

  return res.status(201).json({ orderId: order._id, order });
}

export async function createPendingOrder(req, res) {
  const {
    items,
    shippingAddress,
    paymentMethod = "online",
    couponCode,
    addressId,
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

  const checkoutFingerprint = createCheckoutFingerprint(orderPayload);

  const existingOrder = await Order.findOne({
    user: req.user._id,
    paymentMethod: "online",
    checkoutFingerprint,
    status: "pending",
    paymentStatus: { $in: ["pending", "failed"] },
  }).sort({ createdAt: -1 });

  if (existingOrder) {
    return res.status(200).json({
      orderId: existingOrder._id,
      order: existingOrder,
      reused: true,
    });
  }

  const order = await Order.create({
    user: req.user._id,
    ...orderPayload,
    paymentMethod: "online",
    paymentStatus: "pending",
    status: "pending",
    stockDeducted: false,
    couponApplied: false,
    checkoutFingerprint,
  });

  return res.status(201).json({
    orderId: order._id,
    order,
    reused: false,
  });
}

export async function listMyOrders(req, res) {
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
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

export async function getOrderStatus(req, res) {
  const order = await Order.findOne({ _id: req.params.orderId, user: req.user._id });
  if (!order) {
    return res.status(404).json({
      exists: false,
      orderStatus: "missing",
      paymentStatus: "pending",
    });
  }

  return res.json({
    exists: true,
    orderId: order._id,
    orderStatus: order.status,
    paymentStatus: order.paymentStatus,
    isFinal: ["confirmed", "cancelled"].includes(order.status),
    order,
  });
}
