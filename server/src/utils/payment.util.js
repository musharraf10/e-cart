export async function processOnlinePayment({ amount, currency = "usd", orderId }) {
  // This is a stub for integrating a real payment provider (e.g. Stripe, Razorpay).
  // Replace with actual SDK calls and webhook handling in production.
  return {
    success: true,
    provider: "mock",
    transactionId: `mock_${orderId}_${Date.now()}`,
  };
}

