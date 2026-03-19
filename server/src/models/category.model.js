import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    // Category image URL or data URL
    image: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Category = mongoose.model("Category", categorySchema);

