import mongoose from "mongoose";

const productQuestionSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    question: { type: String, required: true, trim: true },

    // Admin answers (optional until answered)
    answer: { type: String, trim: true },
    answeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Used by UI to visually highlight admin answers
    verified: { type: Boolean, default: false },
    helpfulCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const ProductQuestion = mongoose.model(
  "ProductQuestion",
  productQuestionSchema,
);

