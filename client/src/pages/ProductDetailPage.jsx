import { lazy, Suspense, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client.js";
import { ProductGallery } from "../components/products/ProductGallery.jsx";
import { ProductInfo } from "../components/products/ProductInfo.jsx";
import { ProductSpecs } from "../components/products/ProductSpecs.jsx";
import { ProductReviews } from "../components/products/ProductReviews.jsx";
import { DeliveryEstimator } from "../components/products/DeliveryEstimator.jsx";

const RelatedProducts = lazy(() =>
  import("../components/products/RelatedProducts.jsx").then((m) => ({ default: m.RelatedProducts })),
);

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
    return <div className="text-sm text-gray-500">Loading product…</div>;
  }

  return (
    <div className="space-y-8">
      <section className="grid md:grid-cols-2 gap-8">
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

      <section className="bg-white rounded-xl shadow-sm p-4 text-sm space-y-3">
        <button type="button" onClick={() => setShowDesc((s) => !s)} className="font-semibold">
          Product description {showDesc ? "▲" : "▼"}
        </button>
        {showDesc && (
          <div className="space-y-2 text-gray-700">
            <p>{product.description}</p>
            <p><strong>Fabric details:</strong> Breathable, skin-friendly performance weave.</p>
            <p><strong>Fit type:</strong> Everyday comfort fit.</p>
            <p><strong>Material:</strong> Premium cotton blend.</p>
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

      <section className="bg-white rounded-xl shadow-sm p-4 text-sm">
        <h3 className="font-semibold mb-3">Trust badges</h3>
        <div className="grid sm:grid-cols-3 gap-2">
          <div className="border rounded-lg p-3">🔒 Secure Checkout</div>
          <div className="border rounded-lg p-3">⭐ Quality Guaranteed</div>
          <div className="border rounded-lg p-3">↩️ Easy Returns</div>
        </div>
      </section>

      <Suspense fallback={<div className="text-sm text-gray-500">Loading related products…</div>}>
        <RelatedProducts productId={product._id} categoryId={product.category?._id || product.category} />
      </Suspense>
    </div>
  );
}
