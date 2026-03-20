export const COLOR_SWATCH_MAP = {
  black: "#000000",
  white: "#ffffff",
  blue: "#1e40af",
  red: "#dc2626",
  green: "#16a34a",
  yellow: "#eab308",
  gray: "#6b7280",
  grey: "#6b7280",
  navy: "#0f172a",
  maroon: "#7f1d1d",
  pink: "#ec4899",
  orange: "#f97316",
  purple: "#9333ea",
  beige: "#d6c5a4",
  brown: "#7c4a22",
};

export function getColorSwatch(color) {
  return COLOR_SWATCH_MAP[String(color || "").trim().toLowerCase()] || "#888888";
}

export function normalizeImages(input) {
  if (Array.isArray(input)) return input.filter(Boolean);
  if (typeof input === "string") return input ? [input] : [];
  if (input && typeof input === "object") return Object.values(input).filter(Boolean);
  return [];
}

export function getColorImageSet(product, color) {
  const normalizedColor = String(color || "").trim();
  const colorImages = product?.colorImages || {};
  const variantImages = normalizeImages(colorImages?.[normalizedColor]);

  if (variantImages.length) return variantImages;
  return normalizeImages(product?.images);
}

export function getDisplayPrice(product, color) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const matching = variants.filter((variant) => variant.color === color);
  const inStock = matching.filter((variant) => Number(variant.stock || 0) > 0);
  const pool = inStock.length ? inStock : matching;

  if (pool.length) {
    return Math.min(...pool.map((variant) => Number(variant.price) || 0));
  }

  return Number(product?.price) || 0;
}

export function getVariantInventory(product, color) {
  return (product?.variants || [])
    .filter((variant) => variant.color === color)
    .reduce((sum, variant) => sum + (Number(variant.stock) || 0), 0);
}

export function getProductColors(product) {
  const variantColors = (product?.variants || []).map((variant) => variant.color).filter(Boolean);
  const colorImageKeys = Object.keys(product?.colorImages || {}).filter(Boolean);
  return [...new Set([...variantColors, ...colorImageKeys])];
}

export function getProductRoute(product, color) {
  const search = color ? `?color=${encodeURIComponent(color)}` : "";
  return `/product/${product.slug}${search}`;
}

export function expandProductByVariant(product) {
  if (!product) return [];

  const colors = getProductColors(product);
  if (!colors.length) {
    const fallbackImages = normalizeImages(product.images);
    return [{
      ...product,
      displayColor: "",
      displayImage: fallbackImages[0] || "",
      displayImages: fallbackImages,
      displayPrice: Number(product.price) || 0,
      variantKey: `${product._id || product.slug}-default`,
      variantInventory: (product.variants || []).reduce((sum, variant) => sum + (Number(variant.stock) || 0), 0),
      routeTo: getProductRoute(product),
    }];
  }

  return colors.map((color) => {
    const displayImages = getColorImageSet(product, color);

    return {
      ...product,
      displayColor: color,
      displayImage: displayImages[0] || "",
      displayImages,
      displayPrice: getDisplayPrice(product, color),
      variantKey: `${product._id || product.slug}-${color}`,
      variantInventory: getVariantInventory(product, color),
      routeTo: getProductRoute(product, color),
    };
  });
}

export function expandProductsByVariant(products = []) {
  return products.flatMap(expandProductByVariant);
}
