import { Review } from "../models/review.model.js";
import { Product } from "../models/product.model.js";

export async function listProductReviews(req, res) {
  const reviews = await Review.find({
    product: req.params.productId,
    isApproved: true,
  })
    .populate("user", "name")
    .sort({ createdAt: -1 });

  res.json(reviews);
}

export async function createReview(req, res) {
  const { rating, comment } = req.body;
  const productId = req.params.productId;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    rating,
    comment,
  });

  const approvedReviews = await Review.find({ product: productId, isApproved: true });
  if (approvedReviews.length) {
    const avg =
      approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length;
    product.averageRating = avg;
    product.numReviews = approvedReviews.length;
    await product.save();
  }

  res.status(201).json(review);
}

