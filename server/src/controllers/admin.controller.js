import slugify from "slugify";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { Review } from "../models/review.model.js";
import { Category } from "../models/category.model.js";
import { User } from "../models/user.model.js";
import { Coupon } from "../models/coupon.model.js";
import { Announcement } from "../models/announcement.model.js";
import { ReturnRequest } from "../models/return.model.js";
import { Drop } from "../models/drop.model.js";
import { recalculateProductRatings } from "./review.controller.js";
import { createNotification } from "../services/notification.service.js";

function normalizeColorImages(
  colorImages = {},
  variants = [],
  fallbackImages = [],
) {
  const entries = Object.entries(colorImages || {})
    .map(([color, images]) => [
      String(color || "").trim(),
      Array.isArray(images) ? images.filter(Boolean) : images ? [images] : [],
    ])
    .filter(([color]) => color);

  const normalized = Object.fromEntries(entries);
  const colors = [
    ...new Set(
      (variants || [])
        .map((variant) => String(variant.color || "").trim())
        .filter(Boolean),
    ),
  ];

  colors.forEach((color) => {
    if (!normalized[color] || normalized[color].length === 0) {
      normalized[color] = Array.isArray(fallbackImages)
        ? fallbackImages.filter(Boolean)
        : [];
    }
  });

  return normalized;
}

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

  next.variants = (next.variants || [])
    .map((variant) => ({
      size: variant.size,
      color: variant.color,
      stock: Number(variant.stock) || 0,
      price: Number(variant.price) || 0,
      sku: variant.sku,
    }))
    .filter((variant) => variant.size && variant.color && variant.sku);

  next.images = Array.isArray(next.images) ? next.images.filter(Boolean) : [];
  next.colorImages = normalizeColorImages(
    next.colorImages,
    next.variants,
    next.images,
  );

  if (!next.price && next.variants.length) {
    next.price = Math.min(...next.variants.map((v) => v.price));
  }

  return next;
}

function totalVariantStock(product) {
  return (product.variants || []).reduce(
    (sum, variant) => sum + (variant.stock || 0),
    0,
  );
}

export async function getDashboardMetrics(req, res) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const thirtyDaysAgo = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);

  const [
    totalProducts,
    totalOrders,
    totalCustomers,
    totalRevenueAgg,
    revenueTodayAgg,
    ordersToday,
    lowStockProducts,
    outOfStockProducts,
    recentOrders,
    newCustomerSignups,
    recentReviews,
    revenueLast30Days,
    ordersLast30Days,
    topSellingProducts,
    topCategories,
  ] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    User.countDocuments({ role: "customer" }),
    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, revenue: { $sum: "$total" } } },
    ]),
    Order.aggregate([
      { $match: { paymentStatus: "paid", createdAt: { $gte: startOfToday } } },
      { $group: { _id: null, revenue: { $sum: "$total" } } },
    ]),
    Order.countDocuments({ createdAt: { $gte: startOfToday } }),
    Product.find(),
    Product.find(),
    Order.find().sort({ createdAt: -1 }).limit(5).populate("user", "name"),
    User.find({ role: "customer" })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email createdAt"),
    Review.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name")
      .populate("product", "name"),
    Order.aggregate([
      { $match: { paymentStatus: "paid", createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$total" },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.product", sold: { $sum: "$items.qty" } } },
      { $sort: { sold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: 0,
          productId: "$product._id",
          name: "$product.name",
          sold: 1,
        },
      },
    ]),
    Product.aggregate([
      { $match: { category: { $ne: null } } },
      { $group: { _id: "$category", products: { $sum: 1 } } },
      { $sort: { products: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $project: {
          _id: 0,
          categoryId: "$category._id",
          name: "$category.name",
          products: 1,
        },
      },
    ]),
  ]);

  res.json({
    totalRevenue: totalRevenueAgg[0]?.revenue || 0,
    revenueToday: revenueTodayAgg[0]?.revenue || 0,
    ordersToday,
    totalOrders,
    totalCustomers,
    totalProducts,
    lowStockProducts: lowStockProducts.filter((p) => {
      const stock = totalVariantStock(p);
      return stock > 0 && stock < 5;
    }).length,
    outOfStockProducts: outOfStockProducts.filter(
      (p) => totalVariantStock(p) <= 0,
    ).length,
    recentOrders,
    newCustomerSignups,
    recentReviews,
    charts: {
      revenueLast30Days,
      ordersLast30Days,
      topSellingProducts,
      topCategories,
    },
  });
}

export async function adminListProducts(req, res) {
  const { q, category, stockStatus, visibility, newDrop } = req.query;
  const filters = {};

  if (q) filters.name = { $regex: q, $options: "i" };
  if (category) filters.category = category;
  if (visibility === "visible") filters.isVisible = true;
  if (visibility === "hidden") filters.isVisible = false;
  if (newDrop === "true") filters.isNewDrop = true;
  const products = await Product.find(filters)
    .sort({ createdAt: -1 })
    .populate("category", "name slug");

  const filteredProducts = products.filter((product) => {
    if (!stockStatus) return true;
    const stock = totalVariantStock(product);
    if (stockStatus === "low") return stock > 0 && stock < 5;
    if (stockStatus === "out") return stock <= 0;
    return true;
  });

  res.json(filteredProducts);
}

export async function adminBulkUpdateProducts(req, res) {
  const { ids = [], action, value } = req.body;

  if (!ids.length) {
    res.status(400);
    throw new Error("No products selected");
  }

  if (action === "delete") {
    await Product.deleteMany({ _id: { $in: ids } });
  } else if (action === "hide") {
    await Product.updateMany(
      { _id: { $in: ids } },
      { $set: { isVisible: false } },
    );
  } else if (action === "show") {
    await Product.updateMany(
      { _id: { $in: ids } },
      { $set: { isVisible: true } },
    );
  } else if (action === "update_price") {
    await Product.updateMany(
      { _id: { $in: ids } },
      { $set: { price: Number(value) } },
    );
  } else {
    res.status(400);
    throw new Error("Invalid bulk action");
  }

  res.json({ message: "Bulk action completed successfully" });
}

export async function adminListCategories(req, res) {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });
  res.json(categories);
}

export async function adminCreateCategory(req, res) {
  const { name, description, image } = req.body;

  if (!name || !name.trim()) {
    res.status(400);
    throw new Error("Category name is required");
  }

  if (!image || !String(image).trim()) {
    res.status(400);
    throw new Error("Category image is required");
  }

  const trimmedName = name.trim();
  const slug = slugify(trimmedName, { lower: true, strict: true, trim: true });

  const existing = await Category.findOne({
    $or: [{ name: trimmedName }, { slug }],
  });

  if (existing) {
    res.status(400);
    throw new Error("Category with this name or slug already exists");
  }

  const category = await Category.create({
    name: trimmedName,
    description: description?.trim() || "",
    image: String(image).trim(),
    slug,
    isActive: true,
  });

  res.status(201).json(category);
}

// ────────────────────────────────────────────────
// Product CRUD & Actions
// ────────────────────────────────────────────────

export async function adminGetProductById(req, res) {
  const product = await Product.findById(req.params.id).populate(
    "category",
    "name slug",
  );
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json(product);
}

export async function adminCreateProduct(req, res) {
  const product = await Product.create(normalizeProductPayload(req.body));
  res.status(201).json(product);
}

export async function adminUpdateProduct(req, res) {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    normalizeProductPayload(req.body),
    { new: true, runValidators: true },
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
  res.json({ message: "Product deleted successfully" });
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

export async function adminMarkFeatured(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  product.isFeatured = !product.isFeatured;
  await product.save();
  res.json(product);
}

export async function adminInventoryOverview(req, res) {
  const products = await Product.find()
    .sort({ createdAt: -1 })
    .limit(150)
    .populate("category", "name");

  const lowStock = products.filter((p) => {
    const stock = totalVariantStock(p);
    console.log(`Product: ${p.name}, Calculated Stock: ${stock}`); // Check your console!
    return stock > 0 && stock < 5;
  });
  const outOfStock = products.filter((p) => totalVariantStock(p) <= 0);
  console.log("Low", lowStock);
  res.json({
    items: products,
    lowStockCount: lowStock.length,
    outOfStockCount: outOfStock.length,
  });
}

export async function adminUpdateProductStock(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const { size, color, stock } = req.body;
  const newCount = Number(stock);
  if (!size || !color || Number.isNaN(newCount)) {
    res.status(400);
    throw new Error("Invalid variant stock payload");
  }

  const variant = product.variants.find(
    (v) => v.size === size && v.color === color,
  );
  if (!variant) {
    res.status(404);
    throw new Error("Variant not found");
  }

  variant.stock = newCount;
  await product.save();

  res.json(product);
}

// ────────────────────────────────────────────────
// Orders
// ────────────────────────────────────────────────

export async function adminListOrders(req, res) {
  const { q, status } = req.query;
  const filters = status ? { status } : {};

  let query = Order.find(filters)
    .sort({ createdAt: -1 })
    .populate("user", "name email");

  // Optional: server-side search (can be expensive — consider client-side or DB index)
  if (q) {
    // For large scale → add text index or separate search logic
    const orders = await query;
    const filtered = orders.filter(
      (o) =>
        o._id.toString().includes(q) ||
        o.user?.name?.toLowerCase().includes(q.toLowerCase()) ||
        o.user?.email?.toLowerCase().includes(q.toLowerCase()),
    );
    return res.json(filtered);
  }

  const orders = await query;
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

  if (["shipped", "delivered", "cancelled"].includes(order.status)) {
    await createNotification({
      userId: order.user,
      title: `Order ${order.status}`,
      message: `Your order #${order._id.toString().slice(-6)} is now ${order.status}.`,
      type: "order",
      link: `/account/orders/${order._id}`,
    });
  }

  res.json(order);
}

// ────────────────────────────────────────────────
// Customers
// ────────────────────────────────────────────────

export async function adminListCustomers(req, res) {
  const users = await User.find({ role: "customer" })
    .sort({ createdAt: -1 })
    .select("name email mobileNumber createdAt");

  const customerStats = await Promise.all(
    users.map(async (u) => {
      const orders = await Order.find({ user: u._id });
      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);
      return { ...u.toObject(), totalOrders, totalSpent };
    }),
  );

  res.json(customerStats);
}

export async function adminDeleteCustomer(req, res) {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("Customer not found");
  }
  res.json({ message: "Customer deleted" });
}

export async function adminToggleCustomerBlock(req, res) {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  user.isBlocked = !Boolean(user.isBlocked);
  await user.save();
  res.json(user);
}

// ────────────────────────────────────────────────
// Reviews
// ────────────────────────────────────────────────

export async function adminListReviews(req, res) {
  const reviews = await Review.find()
    .populate("user", "name")
    .populate("product", "name")
    .sort({ createdAt: -1 });

  res.json(reviews);
}

export async function adminHideReview(req, res) {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }
  review.isHidden = true;
  await review.save();
  await recalculateProductRatings(review.product);
  res.json(review);
}

export async function adminUnhideReview(req, res) {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }
  review.isHidden = false;
  await review.save();
  await recalculateProductRatings(review.product);
  res.json(review);
}

export async function adminDeleteReview(req, res) {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }
  await Review.findByIdAndDelete(req.params.id);
  await recalculateProductRatings(review.product);
  res.json({ message: "Review deleted" });
}

// ────────────────────────────────────────────────
// Coupons, Drops, Returns, Analytics, Notifications
// ────────────────────────────────────────────────

export async function adminListCoupons(req, res) {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json(coupons);
}

export async function adminCreateCoupon(req, res) {
  const payload = {
    code: req.body.code,
    discountType: req.body.discountType,
    value: Number(req.body.value),
    minOrder: Number(req.body.minOrder) || 0,
    expiry: req.body.expiry,
    usageLimit:
      req.body.usageLimit === "" || req.body.usageLimit == null
        ? undefined
        : Number(req.body.usageLimit),
    active: req.body.active ?? true,
  };

  const coupon = await Coupon.create(payload);
  res.status(201).json(coupon);
}

export async function adminUpdateCoupon(req, res) {
  const payload = {
    code: req.body.code,
    discountType: req.body.discountType,
    value: Number(req.body.value),
    minOrder: Number(req.body.minOrder) || 0,
    expiry: req.body.expiry,
    usageLimit:
      req.body.usageLimit === "" || req.body.usageLimit == null
        ? undefined
        : Number(req.body.usageLimit),
    active: req.body.active,
  };

  const coupon = await Coupon.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });

  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found");
  }

  res.json(coupon);
}

export async function adminToggleCouponActive(req, res) {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found");
  }
  coupon.active = !coupon.active;
  await coupon.save();
  res.json(coupon);
}

export async function adminDeleteCoupon(req, res) {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found");
  }
  res.json({ message: "Coupon deleted" });
}

// ────────────────────────────────────────────────
// Announcements
// ────────────────────────────────────────────────

export async function adminListAnnouncements(req, res) {
  const announcements = await Announcement.find().sort({ createdAt: -1 });
  res.json(announcements);
}

export async function adminCreateAnnouncement(req, res) {
  const payload = {
    text: req.body.text,
    type: req.body.type || "general",
    active: req.body.active ?? true,
  };
  const announcement = await Announcement.create(payload);

  if (announcement.active) {
    const users = await User.find({ role: "customer" }).select("_id").lean();
    await Promise.allSettled(
      users.map((user) => createNotification({
        userId: user._id,
        title: "New announcement",
        message: announcement.text,
        type: "system",
      })),
    );
  }

  res.status(201).json(announcement);
}

export async function adminUpdateAnnouncement(req, res) {
  const payload = {
    text: req.body.text,
    type: req.body.type || "general",
    active: req.body.active,
  };

  const announcement = await Announcement.findByIdAndUpdate(
    req.params.id,
    payload,
    { new: true, runValidators: true },
  );

  if (!announcement) {
    res.status(404);
    throw new Error("Announcement not found");
  }

  res.json(announcement);
}

export async function adminToggleAnnouncement(req, res) {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) {
    res.status(404);
    throw new Error("Announcement not found");
  }
  announcement.active = !announcement.active;
  await announcement.save();
  res.json(announcement);
}

export async function adminDeleteAnnouncement(req, res) {
  const announcement = await Announcement.findByIdAndDelete(req.params.id);
  if (!announcement) {
    res.status(404);
    throw new Error("Announcement not found");
  }
  res.json({ message: "Announcement deleted" });
}

export async function listActiveAnnouncements(req, res) {
  const active = await Announcement.find({ active: true })
    .sort({ createdAt: -1 })
    .lean();
  res.json(active);
}

export async function adminCreateDrop(req, res) {
  const drop = await Drop.create(req.body);
  res.status(201).json(drop);
}

export async function adminListDrops(req, res) {
  const drops = await Drop.find()
    .populate("product", "name slug")
    .sort({ launchAt: 1 });
  res.json(drops);
}

export async function adminActivateDrop(req, res) {
  const drop = await Drop.findById(req.params.id);
  if (!drop) {
    res.status(404);
    throw new Error("Drop not found");
  }

  drop.isActivated = true;
  await drop.save();

  const product = await Product.findById(drop.product);
  if (product) {
    product.isVisible = true;
    product.isNewDrop = true;
    await product.save();
  }

  res.json(drop);
}

export async function adminListReturns(req, res) {
  const returns = await ReturnRequest.find()
    .populate("user", "name email")
    .populate("order", "_id total status")
    .sort({ createdAt: -1 });

  res.json(returns);
}

export async function adminUpdateReturnStatus(req, res) {
  const request = await ReturnRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error("Return request not found");
  }
  request.status = req.body.status || request.status;
  await request.save();
  res.json(request);
}

export async function adminGetAnalytics(req, res) {
  const [salesByProduct, salesByCategory, dailyRevenue, monthlyRevenue] =
    await Promise.all([
      Order.aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.name",
            revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } },
            qty: { $sum: "$items.qty" },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 20 },
      ]),
      Product.aggregate([
        {
          $group: {
            _id: "$category",
            products: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            category: { $ifNull: ["$category.name", "Uncategorized"] },
            products: 1,
          },
        },
      ]),
      Order.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$total" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            revenue: { $sum: "$total" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

  res.json({ salesByProduct, salesByCategory, dailyRevenue, monthlyRevenue });
}

export async function adminGetNotifications(req, res) {
  const [latestOrder, lowStockItems, newUser, newReview] = await Promise.all([
    Order.findOne().sort({ createdAt: -1 }).populate("user", "name"),
    Product.find().limit(50),
    User.findOne({ role: "customer" }).sort({ createdAt: -1 }),
    Review.findOne().sort({ createdAt: -1 }).populate("product", "name"),
  ]);

  const notifications = [];

  if (latestOrder) {
    notifications.push({
      type: "new_order",
      message: `New order #${latestOrder._id.toString().slice(-6)}`,
    });
  }
  const lowStockCount = lowStockItems.filter((product) => {
    const stock = totalVariantStock(product);
    return stock > 0 && stock < 5;
  }).length;

  if (lowStockCount) {
    notifications.push({
      type: "low_stock",
      message: `${lowStockCount} items are low on stock`,
    });
  }
  if (newUser) {
    notifications.push({
      type: "new_user",
      message: `New customer signup: ${newUser.name}`,
    });
  }
  if (newReview) {
    notifications.push({
      type: "new_review",
      message: `New review on ${newReview.product?.name || "a product"}`,
    });
  }

  res.json(notifications);
}
