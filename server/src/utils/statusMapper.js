export const ORDER_STATUS_FLOW = [
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "in_transit",
  "out_for_delivery",
  "delivered",
];

const LEGACY_STATUS_MAP = {
  processing: "packed",
};

export function normalizeOrderStatus(status) {
  if (!status) return "pending";

  const normalized = String(status).trim().toLowerCase();
  if (ORDER_STATUS_FLOW.includes(normalized)) {
    return normalized;
  }

  if (LEGACY_STATUS_MAP[normalized]) {
    return LEGACY_STATUS_MAP[normalized];
  }

  return null;
}

export function mapExternalStatus(status) {
  const mappedStatus = normalizeOrderStatus(status);
  if (mappedStatus) {
    return mappedStatus;
  }

  console.warn(
    "[shipping] unknown external status received, defaulting to in_transit",
    {
      externalStatus: status,
    },
  );
  return "in_transit";
}

export function isFinalOrderStatus(status) {
  return normalizeOrderStatus(status) === "delivered";
}
