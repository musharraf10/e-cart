import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { HiBadgeCheck, HiStar } from "react-icons/hi";
import api from "../../api/client.js";

function StarRow({ rating, size = "w-4 h-4" }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((value) => (
        <HiStar
          key={value}
          className={`${size} ${value <= Math.round(Number(rating) || 0) ? "text-accent" : "text-[#3a3a3a]"}`}
        />
      ))}
    </div>
  );
}

export function ProductReviews({
  productId,
  reviews,
  setReviews,
  ratingsAverage,
  ratingsCount,
  canReview,
}) {
  const user = useSelector((s) => s.auth.user);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const breakdown = useMemo(() => {
    const map = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      map[r.rating] += 1;
    });
    return map;
  }, [reviews]);


  const displayAverage = useMemo(() => {
    if (!reviews.length) return Number(ratingsAverage) || 0;
    return reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length;
  }, [ratingsAverage, reviews]);

  const displayCount = reviews.length || ratingsCount || 0;
  const sorted = useMemo(() => {
    const safe = [...reviews];
    safe.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return safe;
  }, [reviews]);

  const getUserId = (u) => {
    if (!u) return null;
    if (typeof u === "string") return u;
    if (typeof u === "object") return u._id || u.id || null;
    return null;
  };

  const myReview = useMemo(() => {
    if (!user) return null;
    return reviews.find(
      (r) => String(getUserId(r.user)) === String(getUserId(user)),
    );
  }, [reviews, user]);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const ratingNumber = Number(rating);

      if (images.length > 0) {
        const formData = new FormData();
        formData.append("rating", String(ratingNumber));
        if (comment.trim()) formData.append("comment", comment.trim());
        images.forEach((file) => formData.append("images", file));

        await api.post(`/reviews/${productId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post(`/reviews/${productId}`, {
          rating: ratingNumber,
          comment,
        });
      }
      const { data } = await api.get(`/reviews/${productId}`);
      setReviews(data.reviews || []);
      setComment("");
      setRating(5);
      imagePreviews.forEach((src) => URL.revokeObjectURL(src));
      setImages([]);
      setImagePreviews([]);
    } catch (err) {
      alert(err.response?.data?.message || "Unable to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-8 rounded-2xl p-6 space-y-6 shadow-[0_10px_40px_rgba(0,0,0,0.18)]">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Customer Reviews</h3>
          <p className="text-muted text-sm mt-1">
            {displayCount} review{displayCount === 1 ? "" : "s"}
          </p>
        </div>
        {sorted.length > 3 && (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="text-sm text-accent font-medium active:scale-95 transition-transform"
          >
            {showAll ? "Show less" : "See all"}
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-[220px,1fr] gap-6">
        <div className="rounded-2xl  p-5">
          <div className="flex items-center gap-3">
            <p className="text-3xl font-semibold text-white">
              {displayAverage.toFixed(1)}
            </p>
            <div>
              <StarRow rating={displayAverage} />
              <p className="text-xs text-muted mt-1">Overall product rating</p>
            </div>
          </div>
          <p className="text-muted text-sm mt-4">
            Based on {displayCount} verified customer reviews.
          </p>

          <div className="mt-5 space-y-2.5">
            {[5, 4, 3, 2, 1].map((n) => {
              const count = breakdown[n] || 0;
              const total = reviews.length || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={n} className="flex items-center gap-2">
                  <span className="text-xs text-muted w-10">{n}★</span>
                  <div className="flex-1 h-2 rounded-full bg-[#101010] border border-[#262626] overflow-hidden">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-muted w-10 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          {(showAll ? sorted : sorted.slice(0, 3)).map((r) => (
            <article
              key={r._id}
              className="rounded-2xl border border-[#2a2a2a] bg-gradient-to-b from-[#181818] to-[#121212] p-5 space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-white font-semibold text-sm md:text-base truncate">
                      {r.user?.name || "Customer"}
                    </p>
                    {r.isVerified && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                        <HiBadgeCheck className="w-3.5 h-3.5" />
                        Verified Buyer
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                    <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                    <StarRow rating={r.rating} size="w-4 h-4" />
                  </div>
                </div>
              </div>

              {r.comment ? (
                <p className="text-sm leading-6 text-white/90 whitespace-pre-line">
                  {r.comment}
                </p>
              ) : (
                <p className="text-sm text-muted">Customer left a rating without a written review.</p>
              )}

              {Array.isArray(r.images) && r.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {r.images.slice(0, 6).map((img) => (
                    <div
                      key={img}
                      className="rounded-xl border border-[#262626] bg-[#0f0f0f] overflow-hidden"
                    >
                      <img
                        src={img}
                        alt="Review upload"
                        className="w-full h-20 object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
          {reviews.length === 0 && (
            <p className="text-muted text-sm">No reviews yet.</p>
          )}
        </div>
      </div>

      {user && !myReview ? (
        canReview ? (
          <form onSubmit={submit} className="space-y-3 border-t border-[#262626] pt-6">
            <p className="text-white font-medium text-sm">Write a review</p>
            <div className="flex items-center gap-2 text-sm text-muted">
              <StarRow rating={rating} />
              <span>Select your rating</span>
            </div>
            <select
              className="rounded-xl border border-[#262626] bg-primary px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} Stars
                </option>
              ))}
            </select>
            <textarea
              className="w-full rounded-xl border border-[#262626] bg-primary px-4 py-3 text-white text-sm placeholder-muted focus:outline-none focus:border-accent resize-none"
              placeholder="Share your feedback"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted">
                Photos (optional, up to 5)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                className="block w-full text-sm text-muted rounded-xl border border-[#262626] bg-primary px-3 py-2 focus:outline-none focus:border-accent"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []).slice(0, 5);
                  imagePreviews.forEach((p) => URL.revokeObjectURL(p));
                  setImages(files);
                  setImagePreviews(files.map((f) => URL.createObjectURL(f)));
                }}
              />
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {imagePreviews.map((src, idx) => (
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

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-accent text-primary px-5 py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50 active:scale-95 transition-transform"
            >
              {submitting ? "Submitting…" : "Submit review"}
            </button>
          </form>
        ) : (
          <></>
        )
      ) : user && myReview ? (
        <div className="border-t border-[#262626] pt-6">
          <p className="text-white font-medium text-sm">Thanks for your review!</p>
          <p className="text-muted text-sm mt-1">
            You can only submit one review per product.
          </p>
        </div>
      ) : (
        <p className="text-muted text-sm">Sign in to write a review.</p>
      )}
    </section>
  );
}
