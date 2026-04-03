import crypto from "crypto";
import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import { createNotification } from "../services/notification.service.js";
import {
  dispatchOrderNotificationTasks,
  sendOrderConfirmationEmail,
  sendPaymentSuccessEmail,
  sendStatusEmailByOrder,
} from "../services/order-notification.service.js";
import { createShipment, updateOrderStatus as applyOrderStatusUpdate } from "../services/shippingService.js";
import { normalizeOrderStatus } from "../utils/statusMapper.js";
import { generateInvoicePdfBuffer } from "../utils/invoice.util.js";
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
    status: "confirmed",
    shipping: {
      status: "confirmed",
      statusHistory: [{ status: "confirmed", time: new Date() }],
    },
    stockDeducted: true,
    couponApplied: Boolean(orderPayload.couponCode),
  });

  await markCouponUsed(orderPayload.couponCode);

  await dispatchOrderNotificationTasks([
    createNotification({
      userId: req.user._id,
      title: "Order placed",
      message: `Your order #${order._id.toString().slice(-6)} has been placed successfully.`,
      type: "order",
      link: `/account/orders/${order._id}`,
    }),
    sendOrderConfirmationEmail(order),
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
    shipping: {
      status: "pending",
      statusHistory: [{ status: "pending", time: new Date() }],
    },
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
    orderStatus: order.shipping?.status || order.status,
    paymentStatus: order.paymentStatus,
    isFinal: ["confirmed", "cancelled"].includes(order.status),
    order,
  });
}

export async function getOrderTimeline(req, res) {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).select(
    "_id shipping.statusHistory shipping.events",
  );

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const statusHistory = Array.isArray(order.shipping?.statusHistory) ? order.shipping.statusHistory : [];
  const events = Array.isArray(order.shipping?.events) ? order.shipping.events : [];

  return res.json({
    orderId: order._id,
    statusHistory,
    events,
  });
}


export async function updateOrderStatus(req, res) {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const status = normalizeOrderStatus(req.body?.status);
  if (!status) {
    return res.status(400).json({
      message:
        "Invalid status. Use: pending, confirmed, packed, shipped, in_transit, out_for_delivery, delivered",
    });
  }

  const previousStatus = order.status;

  const result = applyOrderStatusUpdate(order, status, {
    source: "admin",
    eventId: req.body?.eventId,
    eventTime: req.body?.eventTime,
    trackingUrl: req.body?.trackingUrl,
  });

  if (result.ignored) {
    return res.status(200).json({
      message: `Status update ignored (${result.reason})`,
      order,
      ignored: true,
      reason: result.reason,
    });
  }

  if (status === "delivered" && order.paymentMethod === "cod" && order.paymentStatus !== "paid") {
    order.paymentStatus = "paid";
    order.paidAt = new Date();
  }

  createShipment(order);

  await order.save();

  if (previousStatus !== order.status) {
    await dispatchOrderNotificationTasks([
      createNotification({
      userId: order.user,
      title: `Order ${order.status}`,
      message: `Your order #${order._id.toString().slice(-6)} moved from ${previousStatus} to ${order.status}.`,
      type: "order",
      link: `/account/orders/${order._id}`,
      }),
      sendStatusEmailByOrder(order, order.status),
      previousStatus !== "delivered" &&
        order.status === "delivered" &&
        order.paymentMethod === "cod"
        ? sendPaymentSuccessEmail(order)
        : Promise.resolve(),
    ]);
  }

  return res.json({
    message: "Order status updated",
    order,
  });
}

export async function downloadOrderInvoice(req, res) {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).lean();
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.status !== "delivered") {
    res.status(400);
    throw new Error("Invoice is available only after delivery");
  }

  const customer = await User.findById(req.user._id).select("name email").lean();
  const invoiceBuffer = await generateInvoicePdfBuffer({
    order,
    customer,
    options: {
      taxRate: Number(process.env.INVOICE_TAX_RATE || 0),
      currency: process.env.INVOICE_CURRENCY || "INR",
    },
  });

  const invoiceId = order._id.toString().slice(-8).toUpperCase();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="invoice-${invoiceId}.pdf"`);
  res.send(invoiceBuffer);
}
