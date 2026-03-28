import {
  handleWebhook,
  logShippingWebhookEvent,
  processShippingWebhookEvent,
  recordFailedShippingEvent,
  updateShippingMetrics,
} from "../services/shippingService.js";

export async function receiveShippingWebhook(req, res) {
  // Acknowledge immediately; processing should never block provider retries.
  res.status(200).json({ ok: true });

  setImmediate(async () => {
    const rawPayload = req.body || {};
    const payload = handleWebhook(rawPayload);

    try {
      await updateShippingMetrics(payload?.orderId, { eventTime: payload?.eventTime });
      await logShippingWebhookEvent(payload, rawPayload);
      const processResult = await processShippingWebhookEvent(payload);
      if (!processResult?.processed) {
        await updateShippingMetrics(payload?.orderId, {
          incrementTotal: false,
          incrementFailed: true,
          eventTime: payload?.eventTime,
        });
        await recordFailedShippingEvent(payload, new Error(processResult?.reason || "processing_failed"));
      }
    } catch (error) {
      console.error("[shipping-webhook] async processing failed", {
        message: error?.message,
        orderId: payload?.orderId,
        eventId: payload?.eventId,
      });
      await updateShippingMetrics(payload?.orderId, {
        incrementTotal: false,
        incrementFailed: true,
        eventTime: payload?.eventTime,
      });
      await recordFailedShippingEvent(payload, error);
    }
  });
}
