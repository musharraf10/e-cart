import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/client.js";
import { ProductGallery } from "../components/products/ProductGallery.jsx";
import { ProductInfo } from "../components/products/ProductInfo.jsx";
import { ProductSpecs } from "../components/products/ProductSpecs.jsx";
import { getColorImageSet, getProductColors } from "../utils/productVariants.js";

export function ProductDetailPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [product, setProduct] = useState(null);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    (async () => {
      const { data } = await api.get(`/products/${slug}`);
      setProduct(data);

      const colors = getProductColors(data);
      const queryColor = searchParams.get("color") || "";
      const safeColor = colors.find((entry) => entry === queryColor) || colors[0] || "";

      setColor(safeColor);
      setQty(1);
      setSize("");

      if (safeColor && safeColor !== queryColor) {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set("color", safeColor);
        setSearchParams(nextParams, { replace: true });
      }
    })();
  }, [searchParams, setSearchParams, slug]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    return getColorImageSet(product, color);
  }, [product, color]);

  if (!product) {
    return <div className="surface-card h-72 animate-pulse" />;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-6xl space-y-6 px-1">
      <section className="grid gap-6 md:grid-cols-2">
        <ProductGallery key={color} images={galleryImages} alt={color ? `${product.name} in ${color}` : product.name} variantKey={color} />
        <ProductInfo
          product={product}
          size={size}
          color={color}
          qty={qty}
          setSize={setSize}
          setColor={setColor}
          setQty={setQty}
          onWishlistChange={(isWishlisted) => setProduct((prev) => (prev ? { ...prev, isWishlisted } : prev))}
        />
      </section>

      <section className="surface-card p-4">
        <h2 className="mb-3 text-base font-semibold">Product details</h2>
        <p className="mb-3 text-sm text-text-muted">{product.description || "Premium essentials built for daily wear."}</p>
        <ProductSpecs product={product} />
      </section>
    </motion.div>
  );
}
