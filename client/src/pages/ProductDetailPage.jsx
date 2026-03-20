import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/client.js";
import { ProductGallery } from "../components/products/ProductGallery.jsx";
import { ProductInfo } from "../components/products/ProductInfo.jsx";
import { ProductSpecs } from "../components/products/ProductSpecs.jsx";
import { ProductReviews } from "../components/products/ProductReviews.jsx";
import { DeliveryEstimator } from "../components/products/DeliveryEstimator.jsx";
import { ProductQandA } from "../components/products/ProductQandA.jsx";
import { RelatedProducts } from "../components/products/RelatedProducts.jsx";
import { RecommendedProducts } from "../components/products/RecommendedProducts.jsx";

export function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);
  const [openPanel, setOpenPanel] = useState("desc");

  useEffect(() => {
    (async () => {
      const { data } = await api.get(`/products/${slug}`);
      setProduct(data);

      setSize("");
      // Auto-select the first color that has at least 1 unit in stock.
      // Size is set/reset in the color-change effect below.
      const variants = Array.isArray(data.variants) ? data.variants : [];
      const colorsInOrder = [...new Set(variants.map((v) => v.color).filter(Boolean))];
      const firstAvailableColor =
        colorsInOrder.find((c) =>
          variants
            .filter((v) => v.color === c)
            .some((v) => Number(v.stock || 0) > 0),
        ) || colorsInOrder[0] || "";

      setColor(firstAvailableColor);

      const reviewRes = await api.get(`/reviews/${data._id}`);
      setReviews(reviewRes.data);
    })();
  }, [slug]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const normalize = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val.filter(Boolean);
      if (typeof val === "string") return val ? [val] : [];
      if (typeof val === "object") return Object.values(val).filter(Boolean);
      return [];
    };

    const selectedColor = String(color || "").trim();
    const images = product.colorImages?.[selectedColor] || product.images || [];
    return normalize(images);
  }, [product, color]);

  // Reset size whenever the user picks a different color.
  // Then auto-select the first in-stock size for that color.
  useEffect(() => {
    if (!product) return;

    setSize("");

    const available = (product.variants || []).filter(
      (v) => v.color === color && Number(v.stock) > 0,
    );

    if (available.length) {
      setSize(available.size);
    }
  }, [color, product]);

  const panels = useMemo(
    () => [
      {
        key: "desc",
        title: "Description",
        content: product?.description || "Premium NoorFit product crafted for all-day comfort.",
      },
      { key: "spec", title: "Specifications", content: "Fabric, fit, and build details below." },
      { key: "delivery", title: "Delivery Info", content: "Fast dispatch and easy returns." },
    ],
    [product],
  );

  if (!product) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-pulse rounded-xl bg-card border border-[#262626] w-full max-w-4xl h-96" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto px-4 space-y-8"
    >
      <section className="grid gap-10 md:grid-cols-2">
        <ProductGallery
          key={color}
          images={galleryImages}
          alt={product.name}
          variantKey={color}
        />
        <ProductInfo
          product={product}
          size={size}
          color={color}
          qty={qty}
          setSize={setSize}
          setColor={setColor}
          setQty={setQty}
        />
      </section>

      <section className="mt-8 rounded-xl bg-[#171717] border border-[#262626] divide-y divide-[#262626] p-6">
        {panels.map((panel) => (
          <div key={panel.key} className="py-5 first:pt-0 last:pb-0">
            <button
              type="button"
              onClick={() => setOpenPanel((prev) => (prev === panel.key ? "" : panel.key))}
              className="w-full flex items-center justify-between text-left font-semibold text-white"
            >
              {panel.title}
              <span className="text-muted">{openPanel === panel.key ? "−" : "+"}</span>
            </button>
            {openPanel === panel.key && panel.key === "desc" && <p className="mt-3 text-sm text-muted">{panel.content}</p>}
            {openPanel === panel.key && panel.key === "spec" && <div className="mt-4"><ProductSpecs product={product} /></div>}
            {openPanel === panel.key && panel.key === "delivery" && <div className="mt-4"><DeliveryEstimator /></div>}
          </div>
        ))}
      </section>

      <section className="mt-8 rounded-xl bg-[#171717] border border-[#262626] p-6">
        <h3 className="font-semibold text-white mb-4">Trust badges</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-[#262626] p-4 text-center">
            <span className="text-accent font-semibold text-sm">Secure Checkout</span>
          </div>
          <div className="rounded-xl border border-[#262626] p-4 text-center">
            <span className="text-accent font-semibold text-sm">Quality Guaranteed</span>
          </div>
          <div className="rounded-xl border border-[#262626] p-4 text-center">
            <span className="text-accent font-semibold text-sm">Easy Returns</span>
          </div>
        </div>
      </section>

      <ProductReviews
        productId={product._id}
        reviews={reviews}
        setReviews={setReviews}
        ratingsAverage={product.ratingsAverage}
        ratingsCount={product.ratingsCount}
      />

      <div className="mt-8">
        <RelatedProducts
          productId={product._id}
          categoryId={product.category?._id || product.category}
        />
      </div>

      <ProductQandA productId={product._id} />

      <RecommendedProducts excludeProductId={product._id} />
    </motion.div>
  );
}
