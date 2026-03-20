import { Product } from "../models/product.model.js";
import { Coupon } from "../models/coupon.model.js";
import { Order } from "../models/order.model.js";
import { stripe } from "../utils/stripe.js";

async function markCouponUsed(order) {
  if (!order.couponCode || order.couponApplied) return;

  await Coupon.updateOne({ code: order.couponCode }, { $inc: { usedCount: 1 } });
  order.couponApplied = true;
}

async function deductStockForOrder(order) {
  if (order.stockDeducted) return true;

  for (const item of order.items) {
    const result = await Product.updateOne(
      {
        _id: item.product,
        isVisible: true,
        variants: {
          $elemMatch: {
            size: item.size,
            color: item.color,
            stock: { $gte: item.qty },
          },
        },
      },
      {
        $inc: { "variants.$.stock": -item.qty },
      },
    );

    if (result.modifiedCount === 0) {
      return false;
    }
  }

  order.stockDeducted = true;
  return true;
}

function getOrderIdFromEventObject(object) {
  return object?.metadata?.orderId || object?.client_reference_id || null;
}

async function markOrderPaid(order, paymentReference) {
  if (order.paymentStatus === "paid") {
    return order;
  }

  const stockReserved = await deductStockForOrder(order);
  if (!stockReserved) {
    order.paymentStatus = "failed";
    order.status = "cancelled";
    order.paymentDetails = {
      provider: "stripe",
      transactionId: paymentReference,
    };
    await order.save();
    return order;
  }

  order.paymentStatus = "paid";
  order.status = "confirmed";
  order.stripePaymentId = paymentReference;
  order.paymentDetails = {
    provider: "stripe",
    transactionId: paymentReference,
  };
  await markCouponUsed(order);
  await order.save();
  return order;
}

async function markOrderFailed(order, paymentReference) {
  if (order.paymentStatus === "paid") {
    return order;
  }

  order.paymentStatus = "failed";
  order.status = "cancelled";
  order.stripePaymentId = paymentReference || order.stripePaymentId;
  order.paymentDetails = {
    provider: "stripe",
    transactionId: paymentReference || order.paymentDetails?.transactionId,
  };
  await order.save();
  return order;
}

export async function createPaymentIntent(req, res) {
  return res.status(410).json({
    message: "Use /api/orders to create the order and Stripe checkout session.",
  });
}

export async function handleStripeWebhook(req, res) {
  try {
    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error("Stripe webhook is not configured");
    }

    const event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    const object = event.data?.object;
    const orderId = getOrderIdFromEventObject(object);
    const paymentReference = object?.payment_intent || object?.id;

    if (!orderId) {
      console.warn("Stripe webhook missing orderId metadata", { type: event.type });
      return res.status(200).json({ received: true });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      console.warn("Stripe webhook order not found", { orderId, type: event.type });
      return res.status(200).json({ received: true });
    }

    if (event.type === "checkout.session.completed" || event.type === "payment_intent.succeeded") {
      await markOrderPaid(order, paymentReference);
    }

    if (
      event.type === "payment_intent.payment_failed"
      || event.type === "checkout.session.async_payment_failed"
      || event.type === "checkout.session.expired"
    ) {
      await markOrderFailed(order, paymentReference);
    }
  } catch (error) {
    console.error("Stripe webhook error", error.message);
  }

  return res.status(200).json({ received: true });
}
