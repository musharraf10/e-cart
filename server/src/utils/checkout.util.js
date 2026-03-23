import { Address } from "../models/address.model.js";
import { Coupon } from "../models/coupon.model.js";
import { Product } from "../models/product.model.js";

export function findVariant(product, item) {
  return (product.variants || []).find(
    (variant) => variant.size === item.size && variant.color === item.color,
  );
}

function getColorImage(product, color) {
  const colorImages = product.colorImages instanceof Map
    ? product.colorImages.get(color)
    : product.colorImages?.[color];

  return colorImages?.[0] || product.images?.[0] || "";
}

export async function resolveShippingAddress({ userId, shippingAddress, addressId }) {
  if (
    shippingAddress?.line1
    && shippingAddress?.city
    && shippingAddress?.state
    && shippingAddress?.postalCode
    && shippingAddress?.country
  ) {
    return shippingAddress;
  }

  if (!addressId) {
    throw new Error("Shipping address is required");
  }

  const addressDoc = await Address.findOne({ _id: addressId, userId });
  if (!addressDoc) {
    throw new Error("Address not found");
  }

  return {
    line1: addressDoc.addressLine1,
    line2: addressDoc.addressLine2 || "",
    city: addressDoc.city,
    state: addressDoc.state,
    postalCode: addressDoc.postalCode,
    country: addressDoc.country,
  };
}

export async function buildOrderPayload({ items, couponCode, shippingAddress }) {
  const productIds = items.map((item) => item.product);
  const products = await Product.find({ _id: { $in: productIds }, isVisible: true });
  const productMap = new Map(products.map((product) => [String(product._id), product]));

  let subtotal = 0;
  const orderItems = items.map((item) => {
    const product = productMap.get(String(item.product));
    if (!product) {
      throw new Error("Product not found");
    }

    const variant = findVariant(product, item);
    if (!variant) {
      throw new Error(`Variant not found for ${product.name}`);
    }

    const qty = Number(item.qty);
    if (!Number.isFinite(qty) || qty <= 0) {
      throw new Error(`Invalid quantity for ${product.name}`);
    }

    if (variant.stock < qty) {
      throw new Error(`Insufficient stock for ${product.name} (${variant.size} / ${variant.color})`);
    }

    const price = Number(variant.price) || 0;
    subtotal += price * qty;

    return {
      product: product._id,
      productId: String(product._id),
      name: product.name,
      image: getColorImage(product, variant.color),
      price,
      qty,
      size: variant.size,
      color: variant.color,
      sku: variant.sku,
    };
  });

  let discount = 0;
  let appliedCouponCode;

  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: String(couponCode).toUpperCase(),
      active: true,
      expiry: { $gte: new Date() },
    });
    const isWithinUsageLimit = !coupon?.usageLimit || (coupon.usedCount || 0) < coupon.usageLimit;

    if (coupon && isWithinUsageLimit && subtotal >= (coupon.minOrder || 0)) {
      discount = coupon.discountType === "percentage"
        ? (subtotal * coupon.value) / 100
        : coupon.value;
      appliedCouponCode = coupon.code;
    }
  }

  const total = Math.max(0, subtotal - discount);

  return {
    items: orderItems,
    shippingAddress: {
      line1: shippingAddress.line1,
      line2: shippingAddress.line2 || "",
      city: shippingAddress.city,
      state: shippingAddress.state,
      postalCode: shippingAddress.postalCode,
      country: shippingAddress.country,
    },
    subtotal,
    discount,
    total,
    couponCode: appliedCouponCode,
  };
}

export async function deductStockForItems(items) {
  for (const item of items) {
    const result = await Product.updateOne(
      {
        _id: item.product,
        isVisible: true,
        variants: {
          $elemMatch: {
            size: item.size,
            color: item.color,
            stock: { $gte: item.qty },
          },
        },
      },
      {
        $inc: { "variants.$.stock": -item.qty },
      },
    );

    if (result.modifiedCount === 0) {
      return false;
    }
  }

  return true;
}

export async function markCouponUsed(couponCode) {
  if (!couponCode) return;
  await Coupon.updateOne({ code: couponCode }, { $inc: { usedCount: 1 } });
}
