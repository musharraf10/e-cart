import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ProductGallery } from "../components/products/ProductGallery.jsx";
import { ProductInfo } from "../components/products/ProductInfo.jsx";
import { ProductSpecs } from "../components/products/ProductSpecs.jsx";
import { ProductReviews } from "../components/products/ProductReviews.jsx";
import { DeliveryEstimator } from "../components/products/DeliveryEstimator.jsx";
import { ProductQandA } from "../components/products/ProductQandA.jsx";
import { RelatedProducts } from "../components/products/RelatedProducts.jsx";
import { RecommendedProducts } from "../components/products/RecommendedProducts.jsx";
import { getColorImageSet, getProductColors } from "../utils/productVariants.js";
import { SeoMeta } from "../components/seo/SeoMeta.jsx";
import {
  STALE_TIME_SECONDS,
  useGetProductBySlugQuery,
  useGetProductsQuery,
  useGetRelatedProductsQuery,
  useGetReviewsQuery,
} from "../store/apis/catalogApi.js";

export function ProductDetailPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);
  const [openPanel, setOpenPanel] = useState("desc");
  const [localWishlisted, setLocalWishlisted] = useState(null);
  const devColorSyncRef = useRef("");

  const queryOptions = useMemo(
    () => ({
      refetchOnMountOrArgChange: STALE_TIME_SECONDS,
    }),
    [],
  );

  const { data: productData, isLoading: productLoading } = useGetProductBySlugQuery(slug, {
    ...queryOptions,
    skip: !slug,
  });

  const product = useMemo(() => {
    if (!productData) return null;
    if (localWishlisted === null) return productData;
    return { ...productData, isWishlisted: localWishlisted };
  }, [localWishlisted, productData]);

  const productId = productData?._id;
  const categoryId = productData?.category?._id || productData?.category;

  const { data: reviewsData } = useGetReviewsQuery(productId, {
    ...queryOptions,
    skip: !productId,
  });

  const { data: relatedItems = [], isLoading: relatedLoading } = useGetRelatedProductsQuery(
    { productId, categoryId },
    {
      ...queryOptions,
      skip: !productId,
    },
  );

  const { data: recommendedSource, isLoading: recommendedLoading } = useGetProductsQuery(
    { limit: 10, sort: "newest" },
    queryOptions,
  );

  const recommendedItems = useMemo(() => {
    const items = recommendedSource?.items || [];
    if (!productId) return items.slice(0, 8);
    return items.filter((entry) => entry._id !== productId).slice(0, 8);
  }, [productId, recommendedSource]);

  useEffect(() => {
    if (!productData) return;

    setQty(1);
    setSize("");
    setLocalWishlisted(null);

    const colors = getProductColors(productData);
    const queryColor = searchParams.get("color") || "";
    const requestedColor = colors.find((entry) => entry === queryColor);
    const firstAvailableColor =
      colors.find((entry) =>
        (productData.variants || [])
          .filter((variant) => variant.color === entry)
          .some((variant) => Number(variant.stock || 0) > 0),
      ) ||
      colors[0] ||
      "";

    const safeColor = requestedColor || firstAvailableColor;
    setColor(safeColor);

    if (safeColor && safeColor !== queryColor) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set("color", safeColor);
      setSearchParams(nextParams, { replace: true });
    }
  }, [productData, searchParams, setSearchParams]);

  useEffect(() => {
    if (!product || !color) return;

    setQty(1);

    const available = (product.variants || []).filter((variant) => variant.color === color && Number(variant.stock || 0) > 0);

    setSize((currentSize) => {
      const stillValid = available.some((variant) => variant.size === currentSize);
      if (stillValid) return currentSize;
      return available[0]?.size || "";
    });

    const queryColor = searchParams.get("color") || "";
    if (queryColor === color) return;

    const syncSignature = `${product._id}-${color}`;
    if (import.meta.env.DEV && devColorSyncRef.current === syncSignature) {
      return;
    }

    devColorSyncRef.current = syncSignature;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("color", color);
    setSearchParams(nextParams, { replace: true });
  }, [color, product, searchParams, setSearchParams]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    return getColorImageSet(product, color);
  }, [product, color]);

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

  const seoMeta = useMemo(() => {
    if (!product) return null;

    const summary =
      product.summary ||
      product.shortDescription ||
      product.description ||
      "Premium NoorFit product crafted for all-day comfort.";
    const imageSource =
      product.thumbnail ||
      product.images?.[0]?.url ||
      product.images?.[0] ||
      product.variants?.find((variant) => Array.isArray(variant.images) && variant.images.length > 0)?.images?.[0];

    return {
      title: `${product.name} | NoorFit`,
      description: summary,
      canonicalUrl: `/product/${slug}`,
      type: "product",
      image: imageSource,
    };
  }, [product, slug]);

  if (productLoading || !product) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-pulse rounded-xl bg-card border border-[#262626] w-full max-w-4xl h-96" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="max-w-6xl mx-auto px-4 space-y-8">
      {seoMeta && (
        <SeoMeta
          title={seoMeta.title}
          description={seoMeta.description}
          canonicalUrl={seoMeta.canonicalUrl}
          type={seoMeta.type}
          image={seoMeta.image}
        />
      )}
      <section className="grid gap-10 md:grid-cols-2">
        <div className="space-y-4">
          <ProductGallery key={color} images={galleryImages} alt={color ? `${product.name} in ${color}` : product.name} variantKey={color} />
          {(!galleryImages || galleryImages.length === 0) && (
            <p className="text-sm text-muted">This color has no dedicated images yet, so fallback product media is shown.</p>
          )}
        </div>
        <ProductInfo
          product={product}
          size={size}
          color={color}
          qty={qty}
          setSize={setSize}
          setColor={setColor}
          setQty={setQty}
          sizeChart={product.sizeChart}
          onWishlistChange={(isWishlisted) => {
            setLocalWishlisted(isWishlisted);
          }}
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
            {openPanel === panel.key && panel.key === "spec" && (
              <div className="mt-4">
                <ProductSpecs product={product} />
              </div>
            )}
            {openPanel === panel.key && panel.key === "delivery" && (
              <div className="mt-4">
                <DeliveryEstimator />
              </div>
            )}
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
        reviews={reviewsData?.reviews || []}
        ratingsAverage={product.ratingsAverage}
        ratingsCount={product.ratingsCount}
        canReview={Boolean(reviewsData?.canReview)}
      />

      <div className="mt-8">
        <RelatedProducts items={relatedItems} loading={relatedLoading} />
      </div>

      <ProductQandA productId={product._id} />

      <RecommendedProducts items={recommendedItems} loading={recommendedLoading} />
    </motion.div>
  );
}
