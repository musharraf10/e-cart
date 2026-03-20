import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Coupon } from "../models/coupon.model.js";
import { Address } from "../models/address.model.js";
import { stripe } from "../utils/stripe.js";

function findVariant(product, item) {
  return (product.variants || []).find(
    (v) => v.size === item.size && v.color === item.color,
  );
}

function getBaseUrl(req) {
  return (
    process.env.STORE_URL
    || process.env.CLIENT_URL
    || req.headers.origin
    || "http://localhost:5173"
  );
}

async function buildOrderPayload({ items, couponCode, shippingAddress }) {
  const productIds = items.map((item) => item.product);
  const products = await Product.find({ _id: { $in: productIds }, isVisible: true });
  const productMap = new Map(products.map((product) => [String(product._id), product]));

  let subtotal = 0;
  const orderItems = items.map((item) => {
    const product = productMap.get(String(item.product));
    if (!product) {
      throw new Error("Product not found");
    }

    const variant = findVariant(product, item);
    if (!variant) {
      throw new Error(`Variant not found for ${product.name}`);
    }

    const qty = Number(item.qty);
    if (!Number.isFinite(qty) || qty <= 0) {
      throw new Error(`Invalid quantity for ${product.name}`);
    }

    if (variant.stock < qty) {
      throw new Error(`Insufficient stock for ${product.name} (${variant.size} / ${variant.color})`);
    }

    const price = Number(variant.price) || 0;
    subtotal += price * qty;

    return {
      product: product._id,
      name: product.name,
      image: product.images?.[0],
      price,
      qty,
      size: variant.size,
      color: variant.color,
      sku: variant.sku,
    };
  });

  let discount = 0;
  let appliedCouponCode;

  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: String(couponCode).toUpperCase(),
      active: true,
      expiry: { $gte: new Date() },
    });
    const isWithinUsageLimit = !coupon?.usageLimit || (coupon.usedCount || 0) < coupon.usageLimit;

    if (coupon && isWithinUsageLimit && subtotal >= (coupon.minOrder || 0)) {
      discount = coupon.discountType === "percentage"
        ? (subtotal * coupon.value) / 100
        : coupon.value;
      appliedCouponCode = coupon.code;
    }
  }

  const total = Math.max(0, subtotal - discount);

  return {
    items: orderItems,
    shippingAddress: {
      line1: shippingAddress.line1,
      line2: shippingAddress.line2 || "",
      city: shippingAddress.city,
      state: shippingAddress.state,
      postalCode: shippingAddress.postalCode,
      country: shippingAddress.country,
    },
    subtotal,
    discount,
    total,
    couponCode: appliedCouponCode,
  };
}

async function resolveShippingAddress({ userId, shippingAddress, addressId }) {
  if (shippingAddress?.line1 && shippingAddress?.city && shippingAddress?.state && shippingAddress?.postalCode && shippingAddress?.country) {
    return shippingAddress;
  }

  if (!addressId) {
    throw new Error("Shipping address is required");
  }

  const addressDoc = await Address.findOne({ _id: addressId, userId });
  if (!addressDoc) {
    throw new Error("Address not found");
  }

  return {
    line1: addressDoc.addressLine1,
    line2: addressDoc.addressLine2 || "",
    city: addressDoc.city,
    state: addressDoc.state,
    postalCode: addressDoc.postalCode,
    country: addressDoc.country,
  };
}

async function createStripeCheckoutSession({ req, order }) {
  if (!stripe) {
    throw new Error("Stripe not configured");
  }

  const baseUrl = getBaseUrl(req);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: req.user.email,
    line_items: order.items.map((item) => ({
      quantity: item.qty,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(Number(item.price) * 100),
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
          metadata: {
            productId: String(item.product),
            sku: item.sku || "",
            size: item.size || "",
            color: item.color || "",
          },
        },
      },
    })),
    client_reference_id: String(order._id),
    metadata: {
      orderId: String(order._id),
      userId: String(req.user._id),
    },
    payment_intent_data: {
      metadata: {
        orderId: String(order._id),
        userId: String(req.user._id),
      },
    },
    success_url: `${baseUrl}/success?orderId=${order._id}`,
    cancel_url: `${baseUrl}/cancel?orderId=${order._id}`,
  });

  return {
    sessionId: session.id,
    url: session.url,
  };
}

export async function createOrder(req, res) {
  const { items, shippingAddress, paymentMethod = "online", couponCode, addressId } = req.body;

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

  const order = await Order.create({
    user: req.user._id,
    ...orderPayload,
    paymentMethod,
    paymentStatus: "pending",
    status: "pending",
  });

  if (paymentMethod === "cod") {
    return res.status(201).json({ orderId: order._id, order });
  }

  const checkout = await createStripeCheckoutSession({ req, order });
  order.stripeSessionId = checkout.sessionId;
  await order.save();

  return res.status(201).json({
    orderId: order._id,
    order,
    stripeSessionId: checkout.sessionId,
    checkoutUrl: checkout.url,
  });
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
