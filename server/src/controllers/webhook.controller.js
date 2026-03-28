import {
  handleWebhook,
  logShippingWebhookEvent,
  processShippingWebhookEvent,
  recordFailedShippingEvent,
} from "../services/shippingService.js";

export async function receiveShippingWebhook(req, res) {
  // Acknowledge immediately; processing should never block provider retries.
  res.status(200).json({ ok: true });

  setImmediate(async () => {
    const rawPayload = req.body || {};
    const payload = handleWebhook(rawPayload);

    try {
      await logShippingWebhookEvent(payload, rawPayload);
      await processShippingWebhookEvent(payload);
    } catch (error) {
      console.error("[shipping-webhook] async processing failed", {
        message: error?.message,
        orderId: payload?.orderId,
        eventId: payload?.eventId,
      });
      await recordFailedShippingEvent(payload, error);
    }
  });
}
