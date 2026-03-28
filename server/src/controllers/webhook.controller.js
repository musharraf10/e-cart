import { handleWebhook, processShippingWebhookEvent } from "../services/shippingService.js";

export async function receiveShippingWebhook(req, res) {
  const payload = handleWebhook(req.body || {});

  // Acknowledge immediately; processing should never block provider retries.
  res.status(200).json({ ok: true, accepted: true });

  setImmediate(async () => {
    try {
      await processShippingWebhookEvent(payload);
    } catch (error) {
      console.error("[shipping-webhook] async processing failed", {
        message: error?.message,
        orderId: payload?.orderId,
      });
    }
  });
}
