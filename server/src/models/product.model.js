import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    size: { type: String, required: true, set: (val) => val.toUpperCase() },
    color: { type: String, required: true },
    stock: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    sku: { type: String, required: true },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    images: [{ type: String }],
    // Optional color-specific images for each product color.
    // Example:
    // colorImages: { "Black": ["black1.jpg"], "White": ["white1.jpg"] }
    // Kept optional to avoid breaking existing products.
    colorImages: {
      type: Map,
      of: [String],
      default: {},
    },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    variants: [variantSchema],
    isVisible: { type: Boolean, default: true },
    isNewDrop: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    averageRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Product = mongoose.model("Product", productSchema);
