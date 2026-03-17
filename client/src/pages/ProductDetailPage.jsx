import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/client.js";
import { ProductGallery } from "../components/products/ProductGallery.jsx";
import { ProductInfo } from "../components/products/ProductInfo.jsx";
import { ProductSpecs } from "../components/products/ProductSpecs.jsx";
import { ProductReviews } from "../components/products/ProductReviews.jsx";
import { DeliveryEstimator } from "../components/products/DeliveryEstimator.jsx";
import { RelatedProducts } from "../components/products/RelatedProducts.jsx";

export function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);
  const [showDesc, setShowDesc] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await api.get(`/products/${slug}`);
      setProduct(data);
      if (data.sizes?.length) setSize(data.sizes[0]);
      if (data.colors?.length) setColor(data.colors[0]);

      const reviewRes = await api.get(`/reviews/${data._id}`);
      setReviews(reviewRes.data);
    })();
  }, [slug]);

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
      className="space-y-12 md:space-y-16"
    >
      <section className="grid md:grid-cols-2 gap-8 md:gap-12">
        <ProductGallery images={product.images} alt={product.name} />
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

      <section className="rounded-xl bg-card border border-[#262626] p-6">
        <button
          type="button"
          onClick={() => setShowDesc((s) => !s)}
          className="w-full flex items-center justify-between text-left font-semibold text-white"
        >
          Product description
          <span className="text-muted">{showDesc ? "▲" : "▼"}</span>
        </button>
        {showDesc && (
          <div className="mt-4 space-y-3 text-muted text-sm leading-relaxed">
            <p>{product.description}</p>
            <p>
              <strong className="text-white">Fabric details:</strong> Breathable,
              skin-friendly performance weave.
            </p>
            <p>
              <strong className="text-white">Fit type:</strong> Everyday comfort
              fit.
            </p>
            <p>
              <strong className="text-white">Material:</strong> Premium cotton
              blend.
            </p>
          </div>
        )}
      </section>

      <ProductSpecs product={product} />

      <ProductReviews
        productId={product._id}
        reviews={reviews}
        setReviews={setReviews}
        ratingsAverage={product.ratingsAverage}
        ratingsCount={product.ratingsCount}
      />

      <DeliveryEstimator />

      <section className="rounded-xl bg-card border border-[#262626] p-6">
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

      <RelatedProducts
        productId={product._id}
        categoryId={product.category?._id || product.category}
      />
    </motion.div>
  );
}
