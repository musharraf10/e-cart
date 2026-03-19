import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../api/client.js";

const steps = ["pending", "confirmed", "processing", "shipped", "delivered"];

const statusColors = {
  pending: "bg-[#52525b] text-white",
  confirmed: "bg-[#d4af37] text-white",
  processing: "bg-[#d4af37] text-white",
  shipped: "bg-[#3b82f6] text-white",
  delivered: "bg-[#22c55e] text-white",
  cancelled: "bg-[#ef4444] text-white",
};

export function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const [order, setOrder] = useState(null);
  const [reviewedByProductId, setReviewedByProductId] = useState({});
  const [loadingReviews, setLoadingReviews] = useState(false);

  const [reviewModal, setReviewModal] = useState({
    open: false,
    productId: null,
    productName: "",
  });

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
    images: [],
    imagePreviews: [],
  });

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data));
  }, [id]);

  useEffect(() => {
    let mounted = true;
    const loadReviewStatus = async () => {
      if (!order || order.status !== "delivered" || !user) return;
      const productIds = Array.from(
        new Set(
          (order.items || [])
            .map((i) => i.product)
            .filter(Boolean)
            .map(String),
        ),
      );
      if (!productIds.length) return;

      setLoadingReviews(true);
      try {
        const results = await Promise.all(
          productIds.map((pid) => api.get(`/reviews/${pid}`)),
        );

        const next = {};
        results.forEach(({ data }, idx) => {
          const pid = productIds[idx];
          const getUserId = (u) => {
            if (!u) return null;
            if (typeof u === "string") return u;
            if (typeof u === "object") return u._id || u.id || null;
            return null;
          };
          const hasReview = (data || []).some(
            (r) => String(getUserId(r.user)) === String(getUserId(user)),
          );
          next[pid] = hasReview;
        });

        if (mounted) setReviewedByProductId(next);
      } finally {
        if (mounted) setLoadingReviews(false);
      }
    };

    loadReviewStatus();
    return () => {
      mounted = false;
    };
  }, [order, user]);

  const openReviewModal = (item) => {
    const productId = item.product || item._id;
    setReviewModal({
      open: true,
      productId: productId ? String(productId) : null,
      productName: item.name || "",
    });
    setReviewForm({
      rating: 5,
      comment: "",
      images: [],
      imagePreviews: [],
    });
  };

  const closeReviewModal = () => {
    // revoke previews to avoid memory leaks
    reviewForm.imagePreviews.forEach((p) => URL.revokeObjectURL(p));
    setReviewModal({ open: false, productId: null, productName: "" });
    setReviewForm({
      rating: 5,
      comment: "",
      images: [],
      imagePreviews: [],
    });
  };

  const submitReviewFromOrder = async (e) => {
    e.preventDefault();
    if (!reviewModal.productId) return;

    try {
      if (reviewForm.images.length > 0) {
        const formData = new FormData();
        formData.append("rating", String(Number(reviewForm.rating)));
        if (reviewForm.comment.trim())
          formData.append("comment", reviewForm.comment.trim());
        reviewForm.images.forEach((file) => formData.append("images", file));

        await api.post(`/reviews/${reviewModal.productId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post(`/reviews/${reviewModal.productId}`, {
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment,
        });
      }

      setReviewedByProductId((prev) => ({
        ...prev,
        [String(reviewModal.productId)]: true,
      }));
      closeReviewModal();
      alert("Thank you! Your review has been submitted.");
    } catch (err) {
      alert(err.response?.data?.message || "Unable to submit review");
    }
  };

  if (!order)
    return (
      <div className="text-sm text-[#a1a1aa]">Loading order details...</div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/account/orders")}
          className="text-accent hover:opacity-80 transition-colors"
        >
          ← Back to Orders
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Order #{order._id.slice(-6).toUpperCase()}
          </h1>
          <p className="text-[#a1a1aa] text-sm mt-1">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#171717] border border-[#262626] rounded-2xl p-8 shadow-xl">
            <h2 className="text-white text-lg font-semibold mb-6">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 border-b border-[#262626] pb-4 last:border-b-0"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover bg-[#0f0f0f]"
                  />
                  <div className="flex-1">
                    <p className="text-white font-semibold">{item.name}</p>
                    <p className="text-[#a1a1aa] text-sm mt-1">
                      Qty: {item.qty}
                    </p>
                    <p className="text-white font-medium mt-2">
                      ${item.price.toFixed(2)}
                    </p>

                    {order.status === "delivered" && user && (
                      <div className="mt-4 flex items-center gap-3">
                        {loadingReviews ? (
                          <span className="text-xs text-[#a1a1aa]">Checking review status…</span>
                        ) : reviewedByProductId[String(item.product)] ? (
                          <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-300">
                            Reviewed
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openReviewModal(item)}
                            className="rounded-xl bg-accent text-primary px-4 py-2 text-sm font-semibold hover:opacity-90 active:scale-95 transition-transform"
                          >
                            Rate & Review
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#171717] border border-[#262626] rounded-2xl p-8 shadow-xl">
            <h2 className="text-white text-lg font-semibold mb-6">
              Shipping Address
            </h2>
            <div className="space-y-2 text-sm">
              <p className="text-white font-semibold">
                {order.shippingAddress?.name}
              </p>
              <p className="text-[#a1a1aa]">
                {order.shippingAddress?.line1}
              </p>
              {order.shippingAddress?.line2 && (
                <p className="text-[#a1a1aa]">
                  {order.shippingAddress.line2}
                </p>
              )}
              <p className="text-[#a1a1aa]">
                {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
                {order.shippingAddress?.zip}
              </p>
              <p className="text-[#a1a1aa]">{order.shippingAddress?.country}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#171717] border border-[#262626] rounded-2xl p-8 shadow-xl">
            <h2 className="text-white text-lg font-semibold mb-6">
              Order Summary
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#a1a1aa]">Subtotal</span>
                <span className="text-white">
                  ${order.total.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a1a1aa]">Shipping</span>
                <span className="text-white">Free</span>
              </div>
              <div className="border-t border-[#262626] pt-3 flex justify-between">
                <span className="text-white font-semibold">Total</span>
                <span className="text-[#d4af37] text-xl font-bold">
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#171717] border border-[#262626] rounded-2xl p-8 shadow-xl">
            <h2 className="text-white text-lg font-semibold mb-6">
              Order Status
            </h2>
            <div
              className={`px-4 py-2 rounded-full text-center text-sm font-semibold mb-6 ${statusColors[order.status] || statusColors.pending
                }`}
            >
              {order.status.toUpperCase()}
            </div>

            <div className="space-y-3">
              {steps.map((step) => (
                <div
                  key={step}
                  className={`flex items-center gap-3 text-sm ${steps.indexOf(step) <= steps.indexOf(order.status)
                      ? "opacity-100"
                      : "opacity-50"
                    }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${steps.indexOf(step) <= steps.indexOf(order.status)
                        ? "bg-[#d4af37]"
                        : "bg-[#262626]"
                      }`}
                  ></div>
                  <span
                    className={`capitalize ${steps.indexOf(step) <= steps.indexOf(order.status)
                        ? "text-white"
                        : "text-[#a1a1aa]"
                      }`}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#171717] border border-[#262626] rounded-2xl p-8 shadow-xl">
            <h2 className="text-white text-lg font-semibold mb-4">
              Payment Info
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#a1a1aa]">Method</span>
                <span className="text-white capitalize">
                  {order.paymentMethod === "cod"
                    ? "Cash on Delivery"
                    : "Online Payment"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a1a1aa]">Status</span>
                <span className="text-white capitalize">
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {reviewModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-2xl rounded-2xl border border-[#262626] bg-[#0f0f0f] p-6 shadow-xl">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-white text-lg font-semibold">Rate & Review</h2>
                <p className="text-[#a1a1aa] text-sm mt-1">
                  {reviewModal.productName || "Product"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeReviewModal}
                className="rounded-xl border border-[#262626] px-3 py-1.5 text-sm text-muted hover:text-white hover:bg-[#262626]"
                aria-label="Close"
              >
                Close
              </button>
            </div>

            <form onSubmit={submitReviewFromOrder} className="space-y-3">
              <select
                className="rounded-xl border border-[#262626] bg-primary px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent w-full"
                value={reviewForm.rating}
                onChange={(e) =>
                  setReviewForm((f) => ({ ...f, rating: e.target.value }))
                }
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} Stars
                  </option>
                ))}
              </select>

              <textarea
                className="w-full rounded-xl border border-[#262626] bg-primary px-4 py-3 text-white text-sm placeholder-muted focus:outline-none focus:border-accent resize-none"
                placeholder="Optional review text"
                value={reviewForm.comment}
                onChange={(e) =>
                  setReviewForm((f) => ({ ...f, comment: e.target.value }))
                }
                rows={3}
              />

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted">
                  Photos (optional, up to 5)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="block w-full text-sm text-muted"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []).slice(0, 5);
                    // revoke old previews to avoid memory leaks
                    reviewForm.imagePreviews.forEach((p) => URL.revokeObjectURL(p));
                    const previews = files.map((f) => URL.createObjectURL(f));
                    setReviewForm((f) => ({
                      ...f,
                      images: files,
                      imagePreviews: previews,
                    }));
                  }}
                />
                {reviewForm.imagePreviews.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {reviewForm.imagePreviews.map((src, idx) => (
                      <div
                        key={src}
                        className="rounded-xl border border-[#262626] bg-[#0f0f0f] overflow-hidden"
                      >
                        <img
                          src={src}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-20 object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeReviewModal}
                  className="rounded-xl border border-[#262626] px-4 py-2 text-sm text-muted hover:text-white hover:bg-[#262626]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-accent text-primary px-5 py-2 text-sm font-semibold hover:opacity-90 active:scale-95 transition-transform"
                >
                  Submit review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
