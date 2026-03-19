import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    // Core identity
    code: { type: String, required: true, unique: true, uppercase: true },

    // Discount configuration
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    value: { type: Number, required: true }, // percentage value or fixed amount

    // Order constraints
    minOrder: { type: Number, default: 0 },

    // Lifecycle
    expiry: { type: Date, required: true },
    active: { type: Boolean, default: true },

    // Usage tracking
    usageLimit: { type: Number }, // optional cap on redemptions
    usedCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Coupon = mongoose.model("Coupon", couponSchema);


