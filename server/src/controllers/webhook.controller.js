import { Order } from "../models/order.model.js";
import { createNotification } from "../services/notification.service.js";
import {
  dispatchOrderNotificationTasks,
  sendPaymentSuccessEmail,
  sendStatusEmailByOrder,
} from "../services/order-notification.service.js";
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
        return;
      }

      if (processResult.updated && processResult.orderId && processResult.status) {
        const order = await Order.findById(processResult.orderId).select(
          "_id user status paymentMethod paymentStatus shippingTrackingNumber",
        );

        if (order) {
          await dispatchOrderNotificationTasks([
            createNotification({
              userId: order.user,
              title: `Order ${order.status}`,
              message: `Your order #${order._id.toString().slice(-6)} is now ${order.status}.`,
              type: "order",
              link: `/account/orders/${order._id}`,
            }),
            sendStatusEmailByOrder(order, processResult.status),
            processResult.status === "delivered" &&
            order.paymentMethod === "cod" &&
            order.paymentStatus !== "paid"
              ? sendPaymentSuccessEmail(order)
              : Promise.resolve(),
          ]);
        }
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
