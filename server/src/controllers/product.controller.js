import { Product } from "../models/product.model.js";

function withDerivedFields(productDoc) {
  const product = productDoc.toObject ? productDoc.toObject() : productDoc;

  return {
    ...product,
    ratingsAverage: product.averageRating || 0,
    ratingsCount: product.numReviews || 0,
    variants: (product.sizes || []).flatMap((size) =>
      (product.colors || []).map((color) => ({
        size,
        color,
        stock: product.inventoryCount,
      })),
    ),
  };
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
  if (size) filters.sizes = size;
  if (color) filters.colors = color;
  if (onlyNewDrops === "true") filters.isNewDrop = true;

  let sortOption = { createdAt: -1 };
  if (sort === "price_asc") sortOption = { price: 1 };
  if (sort === "price_desc") sortOption = { price: -1 };
  if (sort === "rating") sortOption = { averageRating: -1 };

  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    Product.find(filters).populate("category", "name slug").sort(sortOption).skip(skip).limit(Number(limit)),
    Product.countDocuments(filters),
  ]);

  res.json({
    items: items.map(withDerivedFields),
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    total,
  });
}

export async function getProductBySlug(req, res) {
  const product = await Product.findOne({ slug: req.params.slug }).populate("category", "name slug");
  if (!product || !product.isVisible) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json(withDerivedFields(product));
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

  res.json({ items: items.map(withDerivedFields) });
}

export async function searchProducts(req, res) {
  const { q } = req.query;
  if (!q) {
    return res.json({ items: [] });
  }

  const regex = new RegExp(q, "i");
  const items = await Product.find({
    isVisible: true,
    $or: [{ name: regex }, { description: regex }],
  }).limit(20);

  res.json({ items: items.map(withDerivedFields) });
}
