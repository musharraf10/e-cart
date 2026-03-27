import mongoose from "mongoose";

const sizeChartRowSchema = new mongoose.Schema(
  {
    size: { type: String, required: true, trim: true, uppercase: true },
    chest: { type: Number, min: 0 },
    waist: { type: Number, min: 0 },
    hip: { type: Number, min: 0 },
    length: { type: Number, min: 0 },
  },
  { _id: false },
);

const siteSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "global" },
    storeName: { type: String, default: "NoorFit", trim: true },
    contactEmail: { type: String, default: "support@noorfit.com", trim: true },
    shippingFee: { type: Number, default: 5, min: 0 },
    taxPercentage: { type: Number, default: 5, min: 0 },
    currency: { type: String, default: "USD", trim: true, uppercase: true },
    sizeChartUnit: { type: String, default: "in", enum: ["in", "cm"] },
    sizeChartNotes: { type: String, default: "" },
    sizeChartRows: { type: [sizeChartRowSchema], default: [] },
  },
  { timestamps: true },
);

export const SiteSetting = mongoose.model("SiteSetting", siteSettingSchema);
