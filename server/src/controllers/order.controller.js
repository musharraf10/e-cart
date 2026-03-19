import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Coupon } from "../models/coupon.model.js";
import { stripe } from "../utils/stripe.js";

function findVariant(product, item) {
  return (product.variants || []).find(
    (v) => v.size === item.size && v.color === item.color,
  );
}

export async function createOrder(req, res) {
  const { items, shippingAddress, paymentMethod, couponCode } = req.body;

  if (!items || !items.length) {
    res.status(400);
    throw new Error("No items");
  }

  const productIds = items.map((i) => i.product);
  const products = await Product.find({ _id: { $in: productIds }, isVisible: true });
  const productMap = new Map(products.map((p) => [String(p._id), p]));

  let subtotal = 0;
  const orderItems = items.map((i) => {
    const p = productMap.get(String(i.product));
    if (!p) {
      throw new Error("Product not found");
    }

    const variant = findVariant(p, i);
    if (!variant) {
      throw new Error(`Variant not found for ${p.name}`);
    }

    if (variant.stock < i.qty) {
      throw new Error(`Insufficient stock for ${p.name} (${variant.size} / ${variant.color})`);
    }

    const price = variant.price;
    subtotal += price * i.qty;

    return {
      product: p._id,
      name: p.name,
      image: p.images?.[0],
      price,
      qty: i.qty,
      size: variant.size,
      color: variant.color,
      sku: variant.sku,
    };
  });

  let discount = 0;
  let appliedCouponCode;
  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      active: true,
      expiry: { $gte: new Date() },
    });
    const isWithinUsageLimit =
      !coupon?.usageLimit || (coupon.usedCount || 0) < coupon.usageLimit;

    if (coupon && isWithinUsageLimit && subtotal >= (coupon.minOrder || 0)) {
      if (coupon.discountType === "percentage") {
        discount = (subtotal * coupon.value) / 100;
      } else {
        discount = coupon.value;
      }
      appliedCouponCode = coupon.code;
    }
  }

  const total = subtotal - discount;

  let paymentStatus = "pending";
  let paymentDetails;
  let stripePaymentId;

  if (paymentMethod === "online") {
    const paymentIntentId =
      req.body.paymentIntentId || req.body.stripePaymentIntentId;

    if (!paymentIntentId) {
      res.status(400);
      throw new Error("Missing paymentIntentId");
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      res.status(500);
      throw new Error("Stripe not configured");
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(
      paymentIntentId,
    );

    const expectedAmountPaise = Math.round(Number(total) * 100);

    if (paymentIntent.status !== "succeeded") {
      res.status(400);
      throw new Error("Payment not completed");
    }

    if (paymentIntent.currency !== "inr") {
      res.status(400);
      throw new Error("Unsupported payment currency");
    }

    if (
      paymentIntent.metadata?.userId &&
      paymentIntent.metadata.userId !== String(req.user._id)
    ) {
      res.status(403);
      throw new Error("Payment does not belong to this user");
    }

    if (paymentIntent.amount !== expectedAmountPaise) {
      res.status(400);
      throw new Error("Payment amount mismatch");
    }

    paymentStatus = "paid";
    stripePaymentId = paymentIntent.id;
    paymentDetails = {
      provider: "stripe",
      transactionId: paymentIntent.id,
    };

    // Idempotency: if the webhook already created this order,
    // avoid double-stock deduction and double coupon usage.
    const existingOrder = await Order.findOne({
      stripePaymentId: paymentIntent.id,
      user: req.user._id,
    });
    if (existingOrder) {
      return res.status(200).json(existingOrder);
    }
  }

  for (const item of orderItems) {
    const updateResult = await Product.updateOne(
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

    if (updateResult.modifiedCount === 0) {
      res.status(409);
      throw new Error(`Insufficient stock for ${item.name} (${item.size} / ${item.color})`);
    }
  }

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    paymentStatus,
    paymentDetails,
    stripePaymentId,
    subtotal,
    discount,
    total,
    couponCode: appliedCouponCode,
  });

  // Track coupon usage after successful order creation
  if (appliedCouponCode) {
    await Coupon.updateOne(
      { code: appliedCouponCode },
      { $inc: { usedCount: 1 } },
    );
  }

  res.status(201).json(order);
}

export async function listMyOrders(req, res) {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
}

export async function getOrderById(req, res) {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  res.json(order);
}

export async function verifyPayment(req, res) {
  const { paymentIntentId } = req.params;

  const order = await Order.findOne({
    stripePaymentId: paymentIntentId,
    user: req.user._id,
  }).sort({ createdAt: -1 });

  if (!order) {
    return res.json({ exists: false, status: "processing" });
  }

  return res.json({
    exists: true,
    status: order.paymentStatus,
    order,
  });
}
