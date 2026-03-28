import { Order } from "../models/order.model.js";
import { normalizeOrderStatus } from "../utils/statusMapper.js";
import { canTransitionStatus } from "../utils/statusTransition.js";

export const SHIPPING_PROVIDER = {
  MOCK: "mock",
  SHIPROCKET: "shiprocket",
};

function getSafeDate(input, fallback = new Date()) {
  if (!input) return fallback;
  const date = input instanceof Date ? input : new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}

function ensureShippingEnvelope(order) {
  if (!order.shipping) {
    order.shipping = {};
  }

  if (!order.shipping.provider) {
    order.shipping.provider = SHIPPING_PROVIDER.MOCK;
  }

  if (!order.shipping.status) {
    order.shipping.status = normalizeOrderStatus(order.status) || "pending";
  }

  if (!Array.isArray(order.shipping.statusHistory)) {
    order.shipping.statusHistory = [];
  }

  if (!Array.isArray(order.shipping.events)) {
    order.shipping.events = [];
  }

  if (order.shipping.statusHistory.length === 0) {
    order.shipping.statusHistory.push({
      status: order.shipping.status,
      time: order.createdAt || new Date(),
    });
  }

  return order.shipping;
}

function getLastHistoryEntry(order) {
  const shipping = ensureShippingEnvelope(order);
  const [lastEntry] = shipping.statusHistory.slice(-1);
  return lastEntry || null;
}

function getLastEvent(order) {
  const shipping = ensureShippingEnvelope(order);
  const [lastEvent] = shipping.events.slice(-1);
  return lastEvent || null;
}

function appendStatusHistory(order, status, time) {
  const shipping = ensureShippingEnvelope(order);
  shipping.statusHistory.push({ status, time });
}

function appendShippingEvent(order, { status, source, eventId, time }) {
  const shipping = ensureShippingEnvelope(order);
  shipping.events.push({
    status,
    source: source || "mock",
    ...(eventId ? { eventId } : {}),
    time,
  });
}

export function updateOrderStatus(order, nextStatus, metadata = {}) {
  const normalizedStatus = normalizeOrderStatus(nextStatus);
  if (!normalizedStatus) {
    const error = new Error("Invalid order status");
    error.statusCode = 400;
    throw error;
  }

  const shipping = ensureShippingEnvelope(order);
  const currentStatus =
    normalizeOrderStatus(shipping.status) || normalizeOrderStatus(order.status) || "pending";

  const eventTime = getSafeDate(metadata.eventTime, new Date());
  if (!eventTime) {
    const error = new Error("Invalid event time");
    error.statusCode = 400;
    throw error;
  }

  const lastHistoryEntry = getLastHistoryEntry(order);
  if (lastHistoryEntry?.time && new Date(eventTime) < new Date(lastHistoryEntry.time)) {
    return { updated: false, ignored: true, reason: "out_of_order", status: currentStatus };
  }

  if (currentStatus === normalizedStatus) {
    return { updated: false, ignored: true, reason: "duplicate_status", status: currentStatus };
  }

  const lastEvent = getLastEvent(order);
  if (metadata.eventId && lastEvent?.eventId === metadata.eventId) {
    return { updated: false, ignored: true, reason: "duplicate_event", status: currentStatus };
  }

  if (!canTransitionStatus(currentStatus, normalizedStatus)) {
    const error = new Error(`Invalid status transition: ${currentStatus} -> ${normalizedStatus}`);
    error.statusCode = 409;
    throw error;
  }

  order.status = normalizedStatus;
  shipping.status = normalizedStatus;

  appendStatusHistory(order, normalizedStatus, eventTime);
  appendShippingEvent(order, {
    status: normalizedStatus,
    source: metadata.source || "mock",
    eventId: metadata.eventId,
    time: eventTime,
  });

  if (metadata.trackingUrl) {
    shipping.trackingUrl = metadata.trackingUrl;
  }

  if (normalizedStatus === "delivered") {
    shipping.deliveredAt = eventTime;
    order.deliveredAt = eventTime;
  }

  return { updated: true, ignored: false, reason: null, status: normalizedStatus };
}

export function createShipment(order, shippingProvider = SHIPPING_PROVIDER.MOCK) {
  const shipping = ensureShippingEnvelope(order);
  shipping.provider = shippingProvider;
  shipping.status = shipping.status || "pending";

  if (!shipping.trackingId) {
    shipping.trackingId = `TRK-${order._id.toString().slice(-10).toUpperCase()}`;
  }

  return {
    provider: shipping.provider,
    trackingId: shipping.trackingId,
    status: shipping.status,
  };
}

export async function processShippingWebhookEvent(data) {
  const normalizedStatus = normalizeOrderStatus(data?.status);

  if (!data?.orderId || !normalizedStatus) {
    return { processed: false, reason: "invalid_payload" };
  }

  const order = await Order.findById(data.orderId);
  if (!order) {
    return { processed: false, reason: "order_not_found", orderId: data.orderId };
  }

  const shipping = ensureShippingEnvelope(order);
  if (data.trackingId) shipping.trackingId = data.trackingId;
  if (data.awbCode) shipping.awbCode = data.awbCode;
  if (data.courier) shipping.courier = data.courier;

  const result = updateOrderStatus(order, normalizedStatus, {
    source: "webhook",
    eventId: data.eventId,
    eventTime: data.eventTime,
    trackingUrl: data.trackingUrl,
  });

  if (result.updated) {
    await order.save();
  }

  return { processed: true, ...result, orderId: order._id.toString() };
}

export function handleWebhook(data) {
  return {
    provider: data?.provider || SHIPPING_PROVIDER.MOCK,
    orderId: data?.orderId,
    status: normalizeOrderStatus(data?.status),
    trackingId: data?.trackingId,
    awbCode: data?.awbCode,
    eventId: data?.eventId,
    trackingUrl: data?.trackingUrl,
    eventTime: data?.eventTime || new Date().toISOString(),
  };
}
