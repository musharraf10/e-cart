import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productId: { type: String, required: true },
    name: String,
    image: String,
    price: Number,
    qty: Number,
    size: String,
    color: String,
    sku: String,
  },
  { _id: false },
);

const shippingStatusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "packed",
        "shipped",
        "in_transit",
        "out_for_delivery",
        "delivered",
      ],
      required: true,
    },
    time: { type: Date, default: Date.now },
  },
  { _id: false },
);

const shippingEventSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "packed",
        "shipped",
        "in_transit",
        "out_for_delivery",
        "delivered",
      ],
      required: true,
    },
    source: { type: String, enum: ["mock", "webhook", "admin"], default: "mock" },
    eventId: String,
    time: { type: Date, default: Date.now },
  },
  { _id: false },
);

const orderShippingSchema = new mongoose.Schema(
  {
    provider: { type: String, default: "mock" },
    courier: String,
    trackingId: String,
    awbCode: String,
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "packed",
        "shipped",
        "in_transit",
        "out_for_delivery",
        "delivered",
      ],
      default: "pending",
    },
    statusHistory: { type: [shippingStatusHistorySchema], default: [] },
    events: { type: [shippingEventSchema], default: [] },
    trackingUrl: String,
    estimatedDelivery: Date,
    deliveredAt: Date,
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    shippingAddress: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    shipping: { type: orderShippingSchema, default: () => ({}) },
    paymentMethod: { type: String, enum: ["online", "cod"], required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentDetails: {
      provider: String,
      transactionId: String,
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    checkoutFingerprint: String,
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    couponCode: String,
    stockDeducted: { type: Boolean, default: false },
    couponApplied: { type: Boolean, default: false },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "confirmed",
        "packed",
        "shipped",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    deliveredAt: Date,
    paidAt: Date,
    cancelledAt: Date,
  },
  { timestamps: true },
);

export const Order = mongoose.model("Order", orderSchema);
