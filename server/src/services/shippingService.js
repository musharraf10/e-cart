import { Order } from "../models/order.model.js";
import { mapExternalStatus, normalizeOrderStatus } from "../utils/statusMapper.js";
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

  if (!Array.isArray(order.shipping.webhookLogs)) {
    order.shipping.webhookLogs = [];
  }

  if (!Array.isArray(order.shipping.failedEvents)) {
    order.shipping.failedEvents = [];
  }

  if (!order.shipping.metrics || typeof order.shipping.metrics !== "object") {
    order.shipping.metrics = { totalEvents: 0, failedEvents: 0 };
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
  const normalizedStatus = mapExternalStatus(data?.status);

  if (!data?.orderId || !normalizedStatus) {
    return { processed: false, reason: "invalid_payload" };
  }

  const order = await Order.findById(data.orderId).select(
    "_id status paymentMethod paymentStatus shipping.status shipping.statusHistory shipping.events shipping.webhookLogs shipping.failedEvents createdAt",
  );
  if (!order) {
    return { processed: false, reason: "order_not_found", orderId: data.orderId };
  }

  const shipping = ensureShippingEnvelope(order);
  const eventTime = getSafeDate(data.eventTime, new Date());
  if (!eventTime) {
    return { processed: false, reason: "invalid_event_time", orderId: data.orderId };
  }

  const lastHistoryEntry = getLastHistoryEntry(order);
  if (lastHistoryEntry?.time && new Date(eventTime) < new Date(lastHistoryEntry.time)) {
    return { processed: true, updated: false, ignored: true, reason: "out_of_order", status: shipping.status };
  }

  const duplicateEventCount = data.eventId
    ? shipping.webhookLogs.filter((log) => log?.eventId === data.eventId).length
    : 0;
  if (data.eventId && duplicateEventCount > 1) {
    return {
      processed: true,
      updated: false,
      ignored: true,
      reason: "duplicate_event",
      status: shipping.status,
      orderId: order._id.toString(),
    };
  }

  const currentStatus =
    normalizeOrderStatus(shipping.status) || normalizeOrderStatus(order.status) || "pending";

  const failedEvent = data.eventId
    ? shipping.failedEvents.find((event) => event?.eventId === data.eventId)
    : null;
  if (failedEvent?.processed) {
    return {
      processed: true,
      updated: false,
      ignored: true,
      reason: "already_processed_after_retry",
      status: currentStatus,
      orderId: order._id.toString(),
    };
  }

  if (currentStatus === normalizedStatus) {
    await markFailedEventProcessed(order._id, data.eventId);
    return {
      processed: true,
      updated: false,
      ignored: true,
      reason: "duplicate_status",
      status: currentStatus,
      orderId: order._id.toString(),
    };
  }

  if (!canTransitionStatus(currentStatus, normalizedStatus)) {
    const error = new Error(`Invalid status transition: ${currentStatus} -> ${normalizedStatus}`);
    error.statusCode = 409;
    throw error;
  }

  const updateDoc = {
    $set: {
      status: normalizedStatus,
      "shipping.status": normalizedStatus,
      ...(data.trackingId ? { "shipping.trackingId": data.trackingId } : {}),
      ...(data.awbCode ? { "shipping.awbCode": data.awbCode } : {}),
      ...(data.courier ? { "shipping.courier": data.courier } : {}),
      ...(data.trackingUrl ? { "shipping.trackingUrl": data.trackingUrl } : {}),
      ...(normalizedStatus === "delivered" ? { "shipping.deliveredAt": eventTime, deliveredAt: eventTime } : {}),
      ...(normalizedStatus === "delivered" &&
      order.paymentMethod === "cod" &&
      order.paymentStatus !== "paid"
        ? { paymentStatus: "paid", paidAt: eventTime }
        : {}),
    },
    $push: {
      "shipping.statusHistory": { status: normalizedStatus, time: eventTime },
      "shipping.events": {
        status: normalizedStatus,
        source: "webhook",
        ...(data.eventId ? { eventId: data.eventId } : {}),
        time: eventTime,
      },
    },
  };

  const updatedOrder = await Order.findOneAndUpdate(
    { _id: order._id, "shipping.status": currentStatus },
    updateDoc,
    { new: true },
  );

  if (!updatedOrder) {
    return {
      processed: true,
      updated: false,
      ignored: true,
      reason: "concurrent_update",
      status: currentStatus,
      orderId: order._id.toString(),
    };
  }

  await markFailedEventProcessed(order._id, data.eventId);

  return {
    processed: true,
    updated: true,
    ignored: false,
    reason: null,
    status: normalizedStatus,
    orderId: order._id.toString(),
  };
}

export function handleWebhook(data) {
  return {
    provider: data?.provider || SHIPPING_PROVIDER.MOCK,
    orderId: data?.orderId,
    status: mapExternalStatus(data?.status),
    trackingId: data?.trackingId,
    awbCode: data?.awbCode,
    eventId: data?.eventId,
    trackingUrl: data?.trackingUrl,
    eventTime: data?.eventTime || new Date().toISOString(),
  };
}

export async function updateShippingMetrics(
  orderId,
  { incrementTotal = true, incrementFailed = false, eventTime } = {},
) {
  if (!orderId) {
    return { updated: false, reason: "missing_order_id" };
  }

  const safeEventTime = getSafeDate(eventTime, new Date());
  if (!safeEventTime) {
    return { updated: false, reason: "invalid_event_time" };
  }

  try {
    await Order.updateOne(
      { _id: orderId },
      {
        $inc: {
          ...(incrementTotal ? { "shipping.metrics.totalEvents": 1 } : {}),
          ...(incrementFailed ? { "shipping.metrics.failedEvents": 1 } : {}),
        },
        $set: { "shipping.metrics.lastEventAt": safeEventTime },
      },
    );
    return { updated: true };
  } catch (error) {
    console.error("[shipping-webhook] failed to update metrics", {
      message: error?.message,
      orderId,
    });
    return { updated: false, reason: "metrics_update_failed" };
  }
}

export async function logShippingWebhookEvent(data, rawPayload) {
  if (!data?.orderId) {
    return { logged: false, reason: "missing_order_id" };
  }

  try {
    await Order.updateOne(
      { _id: data.orderId },
      {
        $push: {
          "shipping.webhookLogs": {
            eventId: data.eventId,
            source: "webhook",
            payload: rawPayload,
            receivedAt: new Date(),
          },
        },
      },
    );
    return { logged: true };
  } catch (error) {
    console.error("[shipping-webhook] failed to write webhook log", {
      message: error?.message,
      orderId: data?.orderId,
      eventId: data?.eventId,
    });
    return { logged: false, reason: "log_write_failed" };
  }
}

export async function recordFailedShippingEvent(data, error) {
  if (!data?.orderId) return { stored: false, reason: "missing_order_id" };

  const now = new Date();
  const updateExistingResult = await Order.updateOne(
    { _id: data.orderId, "shipping.failedEvents.eventId": data.eventId },
    {
      $inc: { "shipping.failedEvents.$.retryCount": 1 },
      $set: {
        "shipping.failedEvents.$.error": error?.message || "unknown_error",
        "shipping.failedEvents.$.lastTriedAt": now,
        "shipping.failedEvents.$.payload": data,
        "shipping.failedEvents.$.processed": false,
      },
    },
  );

  if (updateExistingResult.modifiedCount > 0) {
    return { stored: true, updated: true };
  }

  await Order.updateOne(
    { _id: data.orderId },
    {
      $push: {
        "shipping.failedEvents": {
          eventId: data.eventId,
          payload: data,
          error: error?.message || "unknown_error",
          retryCount: 1,
          lastTriedAt: now,
          processed: false,
        },
      },
    },
  );

  return { stored: true };
}

export async function markFailedEventProcessed(orderId, eventId) {
  if (!orderId || !eventId) return { updated: false, reason: "missing_identifiers" };

  await Order.updateOne(
    { _id: orderId, "shipping.failedEvents.eventId": eventId },
    {
      $set: {
        "shipping.failedEvents.$.processed": true,
        "shipping.failedEvents.$.lastTriedAt": new Date(),
      },
    },
  );

  return { updated: true };
}
