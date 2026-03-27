import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    size: { type: String, required: true, set: (val) => val.toUpperCase() },
    color: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    sku: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const sizeChartRowSchema = new mongoose.Schema(
  {
    size: { type: String, required: true, trim: true, uppercase: true },
    chest: { type: Number, min: 0, default: null },
    waist: { type: Number, min: 0, default: null },
    hip: { type: Number, min: 0, default: null },
    length: { type: Number, min: 0, default: null },
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
    colorImages: {
      type: Map,
      of: [String],
      default: {},
    },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    variants: [variantSchema],
    sizeChart: {
      unit: { type: String, enum: ["in", "cm"], default: "in" },
      notes: { type: String, default: "" },
      rows: { type: [sizeChartRowSchema], default: [] },
    },
    isVisible: { type: Boolean, default: true },
    isNewDrop: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    averageRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true },
);

productSchema.index({ name: "text", description: "text" });

productSchema.pre("validate", function validateVariantImages(next) {
  const colors = [...new Set((this.variants || []).map((variant) => variant.color).filter(Boolean))];
  const colorImageEntries = this.colorImages instanceof Map ? this.colorImages : new Map(Object.entries(this.colorImages || {}));

  colors.forEach((color) => {
    const colorGallery = colorImageEntries.get(color) || [];
    if (!Array.isArray(colorGallery) || colorGallery.filter(Boolean).length === 0) {
      if ((this.images || []).length > 0) {
        colorImageEntries.set(color, [...this.images]);
      }
    }
  });

  this.colorImages = colorImageEntries;
  next();
});

export const Product = mongoose.model("Product", productSchema);
