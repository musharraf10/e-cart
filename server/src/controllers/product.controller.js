import jwt from "jsonwebtoken";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import { SiteSetting } from "../models/siteSetting.model.js";

let productIndexInitPromise;

async function ensureProductTextIndex() {
  if (!productIndexInitPromise) {
    productIndexInitPromise = Product.init();
  }
  await productIndexInitPromise;
}

function withDerivedFields(productDoc, options = {}) {
  const { wishlistedProductIds = [] } = options;
  const product = productDoc.toObject ? productDoc.toObject() : productDoc;
  product.colorImages = product.colorImages instanceof Map ? Object.fromEntries(product.colorImages) : (product.colorImages || {});
  const variants = product.variants || [];
  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))];
  const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))];
  const inventoryCount = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  const minVariantPrice = variants.length
    ? Math.min(...variants.map((v) => Number(v.price) || 0))
    : product.price;

  return {
    ...product,
    price: minVariantPrice,
    ratingsAverage: product.averageRating || 0,
    ratingsCount: product.numReviews || 0,
    sizes,
    colors,
    inventoryCount,
    variants,
    isWishlisted: wishlistedProductIds.includes(String(product._id)),
  };
}

async function getRequestUserId(req) {
  let token;
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id || null;
  } catch {
    return null;
  }
}

async function getRequestWishlistProductIds(req) {
  const userId = await getRequestUserId(req);
  if (!userId) return [];

  const user = await User.findById(userId).select("wishlist");
  if (!user) return [];
  return (user.wishlist || []).map((id) => String(id));
}

async function getRequestWishlistState(req, productId) {
  const userId = await getRequestUserId(req);
  if (!userId) return false;

  const isWishlisted = await User.exists({
    _id: userId,
    wishlist: productId,
  });

  return Boolean(isWishlisted);
}

export async function listProducts(req, res) {
  const {
    page = 1,
    limit = 16,
    category,
    minPrice,
    maxPrice,
    size,
    color,
    sort = "newest",
    onlyNewDrops,
  } = req.query;

  const filters = { isVisible: true };
  if (category) filters.category = category;
  if (minPrice) filters.price = { ...(filters.price || {}), $gte: Number(minPrice) };
  if (maxPrice) filters.price = { ...(filters.price || {}), $lte: Number(maxPrice) };
  if (size) filters["variants.size"] = size;
  if (color) filters["variants.color"] = color;
  if (onlyNewDrops === "true") filters.isNewDrop = true;

  let sortOption = { createdAt: -1 };
  if (sort === "price_asc") sortOption = { price: 1 };
  if (sort === "price_desc") sortOption = { price: -1 };
  if (sort === "rating") sortOption = { averageRating: -1 };

  const skip = (Number(page) - 1) * Number(limit);

  const [items, total, wishlistedProductIds] = await Promise.all([
    Product.find(filters).populate("category", "name slug").sort(sortOption).skip(skip).limit(Number(limit)),
    Product.countDocuments(filters),
    getRequestWishlistProductIds(req),
  ]);

  res.json({
    items: items.map((item) => withDerivedFields(item, { wishlistedProductIds })),
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    total,
  });
}

export async function getProductBySlug(req, res) {
  const [product, siteSettings] = await Promise.all([
    Product.findOne({ slug: req.params.slug }).populate("category", "name slug"),
    SiteSetting.findOne({ key: "global" }).select("sizeChartRows sizeChartUnit sizeChartNotes"),
  ]);

  if (!product || !product.isVisible) {
    res.status(404);
    throw new Error("Product not found");
  }

  const plainProduct = product.toObject ? product.toObject() : product;
  plainProduct.colorImages = product.colorImages
    ? Object.fromEntries(product.colorImages)
    : {};

  const isWishlisted = await getRequestWishlistState(req, product._id);

  res.json({
    ...withDerivedFields(plainProduct),
    isWishlisted,
    sizeChart: {
      rows: plainProduct?.sizeChart?.rows?.length
        ? plainProduct.sizeChart.rows
        : siteSettings?.sizeChartRows || [],
      unit: plainProduct?.sizeChart?.unit || siteSettings?.sizeChartUnit || "in",
      notes: plainProduct?.sizeChart?.notes || siteSettings?.sizeChartNotes || "",
    },
  });
}

export async function getRelatedProducts(req, res) {
  const baseProduct = await Product.findById(req.params.productId);
  if (!baseProduct) {
    res.status(404);
    throw new Error("Product not found");
  }

  const items = await Product.find({
    _id: { $ne: baseProduct._id },
    isVisible: true,
    $or: [{ category: baseProduct.category }, { isFeatured: true }, { isNewDrop: true }],
  })
    .limit(Number(req.query.limit || 4))
    .sort({ averageRating: -1, createdAt: -1 });

  res.json({ items: items.map((item) => withDerivedFields(item)) });
}

export async function searchProducts(req, res) {
  const { q = "", category, page = 1, limit = 12 } = req.query;
  const trimmedQuery = String(q).trim();
  const pageNumber = Math.max(Number(page) || 1, 1);
  const pageLimit = Math.min(Math.max(Number(limit) || 12, 1), 50);
  const skip = (pageNumber - 1) * pageLimit;
  const baseFilters = { isVisible: true };

  if (category) {
    baseFilters.category = category;
  }

  await ensureProductTextIndex();

  if (!trimmedQuery) {
    const [products, total, wishlistedProductIds] = await Promise.all([
      Product.find(baseFilters)
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit),
      Product.countDocuments(baseFilters),
      getRequestWishlistProductIds(req),
    ]);

    return res.json({
      products: products.map((item) => withDerivedFields(item, { wishlistedProductIds })),
      total,
      page: pageNumber,
      pages: total > 0 ? Math.ceil(total / pageLimit) : 0,
    });
  }

  const filters = {
    ...baseFilters,
    $text: { $search: trimmedQuery },
  };

  const [products, total, wishlistedProductIds] = await Promise.all([
    Product.find(filters, {
      name: 1,
      slug: 1,
      description: 1,
      price: 1,
      originalPrice: 1,
      images: 1,
      colorImages: 1,
      category: 1,
      variants: 1,
      isVisible: 1,
      isNewDrop: 1,
      isFeatured: 1,
      averageRating: 1,
      numReviews: 1,
      createdAt: 1,
      updatedAt: 1,
      score: { $meta: "textScore" },
    })
      .populate("category", "name slug")
      .sort({ score: { $meta: "textScore" }, createdAt: -1 })
      .skip(skip)
      .limit(pageLimit),
    Product.countDocuments(filters),
    getRequestWishlistProductIds(req),
  ]);

  const pages = total > 0 ? Math.ceil(total / pageLimit) : 0;

  res.json({
    products: products.map((item) => withDerivedFields(item, { wishlistedProductIds })),
    total,
    page: pageNumber,
    pages,
  });
}
