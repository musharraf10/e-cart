import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { Review } from "../models/review.model.js";
import { Category } from "../models/category.model.js";

// function normalizeProductPayload(payload) {
//   const next = { ...payload };

//   if (typeof next.visible === "boolean") {
//     next.isVisible = next.visible;
//     delete next.visible;
//   }

//   if (typeof next.newDrop === "boolean") {
//     next.isNewDrop = next.newDrop;
//     delete next.newDrop;
//   }

//   if (next.stock !== undefined) {
//     next.inventoryCount = Number(next.stock);
//     next.inStock = Number(next.stock) > 0;
//     delete next.stock;
//   }

//   return next;
// }

function normalizeProductPayload(payload) {
  const next = { ...payload };

  if (typeof next.visible === "boolean") {
    next.isVisible = next.visible;
    delete next.visible;
  }

  if (typeof next.newDrop === "boolean") {
    next.isNewDrop = next.newDrop;
    delete next.newDrop;
  }

  if (next.stock !== undefined) {
    next.inventoryCount = Number(next.stock);
    next.inStock = Number(next.stock) > 0;
    delete next.stock;
  }

  return next;
}

export async function getDashboardMetrics(req, res) {
  const [totalProducts, totalOrders, totalRevenueAgg, recentOrders] =
    await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, revenue: { $sum: "$total" } } },
      ]),
      Order.find().sort({ createdAt: -1 }).limit(5),
    ]);

  const totalRevenue = totalRevenueAgg[0]?.revenue || 0;

  res.json({
    totalProducts,
    totalOrders,
    totalRevenue,
    recentOrders,
  });
}

export async function adminListProducts(req, res) {
  const products = await Product.find()
    .sort({ createdAt: -1 })
    .populate("category", "name slug");
  res.json(products);
}

export async function adminListCategories(req, res) {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });
  res.json(categories);
}

export async function adminCreateProduct(req, res) {
  const product = await Product.create(normalizeProductPayload(req.body));
  res.status(201).json(product);
}

export async function adminUpdateProduct(req, res) {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    normalizeProductPayload(req.body),
    {
      new: true,
    },
  );
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json(product);
}

export async function adminDeleteProduct(req, res) {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json({ message: "Deleted" });
}

export async function adminToggleVisibility(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  product.isVisible = !product.isVisible;
  await product.save();
  res.json(product);
}

export async function adminMarkNewDrop(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  product.isNewDrop = !product.isNewDrop;
  await product.save();
  res.json(product);
}

export async function adminListOrders(req, res) {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .populate("user", "name email");
  res.json(orders);
}

export async function adminUpdateOrderStatus(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  order.status = req.body.status || order.status;
  await order.save();
  res.json(order);
}

export async function adminListReviews(req, res) {
  const reviews = await Review.find()
    .populate("user", "name")
    .populate("product", "name");
  res.json(reviews);
}

export async function adminApproveReview(req, res) {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }
  review.isApproved = true;
  await review.save();
  res.json(review);
}

export async function adminRejectReview(req, res) {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }
  review.isApproved = false;
  await review.save();
  res.json(review);
}
