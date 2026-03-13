import { Review } from "../models/review.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";

async function recalculateProductRatings(productId) {
  const visibleReviews = await Review.find({ product: productId, isHidden: false });
  const product = await Product.findById(productId);
  if (!product) return;

  if (!visibleReviews.length) {
    product.averageRating = 0;
    product.numReviews = 0;
    await product.save();
    return;
  }

  const avg = visibleReviews.reduce((sum, r) => sum + r.rating, 0) / visibleReviews.length;
  product.averageRating = avg;
  product.numReviews = visibleReviews.length;
  await product.save();
}

export async function listProductReviews(req, res) {
  const reviews = await Review.find({
    product: req.params.productId,
    isHidden: false,
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

  const hasPurchased = await Order.exists({
    user: req.user._id,
    items: { $elemMatch: { product: product._id } },
  });

  if (!hasPurchased) {
    res.status(403);
    throw new Error("You can only review products you purchased");
  }

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    rating,
    comment,
  });

  await recalculateProductRatings(productId);

  res.status(201).json(review);
}

export { recalculateProductRatings };
