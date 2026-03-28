import { normalizeOrderStatus } from "../utils/statusMapper.js";

export const SHIPPING_PROVIDER = {
  MOCK: "mock",
  SHIPROCKET: "shiprocket",
};

function appendStatusHistory(order, status) {
  if (!Array.isArray(order.shipping.statusHistory)) {
    order.shipping.statusHistory = [];
  }

  order.shipping.statusHistory.push({
    status,
    time: new Date(),
  });
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

  if (!Array.isArray(order.shipping.statusHistory) || order.shipping.statusHistory.length === 0) {
    order.shipping.statusHistory = [
      {
        status: order.shipping.status,
        time: order.createdAt || new Date(),
      },
    ];
  }

  return order.shipping;
}

export function updateOrderShippingStatus(order, nextStatus) {
  const normalizedStatus = normalizeOrderStatus(nextStatus);
  if (!normalizedStatus) {
    const error = new Error("Invalid order status");
    error.statusCode = 400;
    throw error;
  }

  const shipping = ensureShippingEnvelope(order);
  const currentStatus = normalizeOrderStatus(shipping.status) || normalizeOrderStatus(order.status);

  if (currentStatus === normalizedStatus) {
    return order;
  }

  order.status = normalizedStatus;
  shipping.status = normalizedStatus;
  appendStatusHistory(order, normalizedStatus);

  if (normalizedStatus === "delivered") {
    const deliveredAt = new Date();
    shipping.deliveredAt = deliveredAt;
    order.deliveredAt = deliveredAt;
  }

  return order;
}

export function createShipment(order, shippingProvider = SHIPPING_PROVIDER.MOCK) {
  // Placeholder abstraction. Keep this provider-agnostic; do not couple to a courier SDK here.
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

export function handleWebhook(data) {
  // Placeholder for async webhook handling.
  // Expected generic envelope:
  // {
  //   orderId: string,
  //   status: string,
  //   trackingId?: string,
  //   awbCode?: string,
  //   eventTime?: string
  // }
  return {
    provider: data?.provider || SHIPPING_PROVIDER.MOCK,
    orderId: data?.orderId,
    status: normalizeOrderStatus(data?.status),
    trackingId: data?.trackingId,
    awbCode: data?.awbCode,
    eventTime: data?.eventTime || new Date().toISOString(),
  };
}
