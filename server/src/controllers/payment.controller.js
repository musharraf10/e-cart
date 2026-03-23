import { Order } from "../models/order.model.js";
import { stripe } from "../utils/stripe.js";
import {
  buildOrderPayload,
  deductStockForItems,
  markCouponUsed,
  resolveShippingAddress,
} from "../utils/checkout.util.js";

async function deductStockForOrder(order) {
  if (order.stockDeducted) return true;

  const reserved = await deductStockForItems(order.items);
  if (!reserved) return false;
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
  await markCouponUsed(order.couponCode);
  order.couponApplied = Boolean(order.couponCode);
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
  if (!stripe) {
    res.status(503);
    throw new Error("Stripe is not configured");
  }

  const { items, shippingAddress, couponCode, addressId } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error("No items");
  }

  const addressSnapshot = await resolveShippingAddress({
    userId: req.user._id,
    shippingAddress,
    addressId,
  });

  const orderPayload = await buildOrderPayload({
    items,
    couponCode,
    shippingAddress: addressSnapshot,
  });

  const amount = Math.round(orderPayload.total * 100);
  if (amount <= 0) {
    res.status(400);
    throw new Error("Order total must be greater than zero");
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "inr",
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: "never",
    },
    metadata: {
      userId: String(req.user._id),
      itemCount: String(orderPayload.items.length),
    },
  });

  return res.status(201).json({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    amount: orderPayload.total,
    currency: "inr",
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

    const order = orderId
      ? await Order.findById(orderId)
      : await Order.findOne({ stripePaymentId: paymentReference }).sort({ createdAt: -1 });

    if (!order) {
      console.warn("Stripe webhook order not found", { orderId, paymentReference, type: event.type });
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
