export const VALID_STATUS_TRANSITIONS = {
  pending: ["confirmed"],
  confirmed: ["packed"],
  packed: ["shipped"],
  shipped: ["in_transit"],
  in_transit: ["out_for_delivery"],
  out_for_delivery: ["delivered"],
  delivered: [],
};

export function canTransitionStatus(currentStatus, nextStatus) {
  if (!currentStatus || !nextStatus) return false;
  if (currentStatus === nextStatus) return true;

  const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || [];
  return allowedTransitions.includes(nextStatus);
}
