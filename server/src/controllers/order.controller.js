import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Coupon } from "../models/coupon.model.js";
import { processOnlinePayment } from "../utils/payment.util.js";

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
    if (p.inventoryCount < i.qty) {
      throw new Error(`Insufficient inventory for ${p.name}`);
    }
    const price = p.price;
    subtotal += price * i.qty;
    return {
      product: p._id,
      name: p.name,
      image: p.images?.[0],
      price,
      qty: i.qty,
      size: i.size,
      color: i.color,
    };
  });

  let discount = 0;
  let appliedCouponCode;
  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validTo: { $gte: new Date() },
    });
    if (coupon && subtotal >= coupon.minOrderValue) {
      if (coupon.discountType === "percentage") {
        discount = (subtotal * coupon.discountValue) / 100;
      } else {
        discount = coupon.discountValue;
      }
      if (coupon.maxDiscountValue) {
        discount = Math.min(discount, coupon.maxDiscountValue);
      }
      appliedCouponCode = coupon.code;
    }
  }

  const total = subtotal - discount;

  let paymentStatus = "pending";
  let paymentDetails;

  if (paymentMethod === "online") {
    const payment = await processOnlinePayment({
      amount: total,
      currency: "usd",
      orderId: req.user._id,
    });
    if (!payment.success) {
      res.status(400);
      throw new Error("Payment failed");
    }
    paymentStatus = "paid";
    paymentDetails = {
      provider: payment.provider,
      transactionId: payment.transactionId,
    };
  }

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    paymentStatus,
    paymentDetails,
    subtotal,
    discount,
    total,
    couponCode: appliedCouponCode,
  });

  await Promise.all(
    orderItems.map((i) =>
      Product.findByIdAndUpdate(i.product, {
        $inc: { inventoryCount: -i.qty },
        $set: { inStock: true },
      }),
    ),
  );

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

