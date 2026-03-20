import jwt from "jsonwebtoken";
import { Review } from "../models/review.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";

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

async function resolveRequestUser(req) {
  if (req.user?._id) return req.user;

  let token;
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return await User.findById(decoded.id).select("-password");
  } catch {
    return null;
  }
}

async function checkCanReview(productId, userId) {
  if (!userId) return false;

  return Boolean(
    await Order.exists({
      user: userId,
      status: "delivered",
      items: { $elemMatch: { product: productId } },
    }),
  );
}

export async function listProductReviews(req, res) {
  const [reviews, user] = await Promise.all([
    Review.find({
      product: req.params.productId,
      isHidden: false,
    })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .lean(),
    resolveRequestUser(req),
  ]);

  const canReview = await checkCanReview(req.params.productId, user?._id);

  res.json({
    reviews,
    canReview,
  });
}

export async function createReview(req, res) {
  const { rating, comment } = req.body;
  const productId = req.params.productId;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const hasDeliveredOrder = await checkCanReview(product._id, req.user._id);

  if (!hasDeliveredOrder) {
    res.status(403);
    throw new Error("You can only review products you received (delivered)");
  }

  const images =
    Array.isArray(req.files) && req.files.length
      ? req.files
          .map((f) => (f?.filename ? `/uploads/reviews/${f.filename}` : null))
          .filter(Boolean)
      : [];

  try {
    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating,
      comment,
      images,
      isVerified: true,
    });

    await recalculateProductRatings(productId);

    res.status(201).json(review);
  } catch (err) {
    if (err && err.code === 11000) {
      res.status(409);
      throw new Error("You already reviewed this product");
    }
    throw err;
  }
}

export { recalculateProductRatings, checkCanReview };
