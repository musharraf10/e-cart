import mongoose from "mongoose";

const returnSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["return", "refund", "exchange"], default: "return" },
    reason: String,
    status: {
      type: String,
      enum: ["requested", "approved", "rejected", "completed"],
      default: "requested",
    },
  },
  { timestamps: true },
);

export const ReturnRequest = mongoose.model("ReturnRequest", returnSchema);
