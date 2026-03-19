import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    active: { type: Boolean, default: true },
    type: {
      type: String,
      enum: ["coupon", "offer", "general"],
      default: "general",
    },
  },
  { timestamps: true },
);

export const Announcement = mongoose.model(
  "Announcement",
  announcementSchema,
);

