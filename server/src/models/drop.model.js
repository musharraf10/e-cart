import mongoose from "mongoose";

const dropSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    launchAt: { type: Date, required: true },
    isActivated: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Drop = mongoose.model("Drop", dropSchema);
