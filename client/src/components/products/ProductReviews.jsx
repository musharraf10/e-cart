import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { HiStar } from "react-icons/hi";
import api from "../../api/client.js";

export function ProductReviews({
  productId,
  reviews,
  setReviews,
  ratingsAverage,
  ratingsCount,
}) {
  const user = useSelector((s) => s.auth.user);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const breakdown = useMemo(() => {
    const map = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      map[r.rating] += 1;
    });
    return map;
  }, [reviews]);

  const sorted = useMemo(() => {
    const safe = [...reviews];
    safe.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return safe;
  }, [reviews]);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/reviews/${productId}`, {
        rating: Number(rating),
        comment,
      });
      const { data } = await api.get(`/reviews/${productId}`);
      setReviews(data);
      setComment("");
      setRating(5);
    } catch (err) {
      alert(err.response?.data?.message || "Unable to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-8 rounded-xl bg-[#171717] border border-[#262626] p-6 space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Customer Reviews</h3>
          <p className="text-muted text-sm mt-1">
            {ratingsCount || 0} review{(ratingsCount || 0) === 1 ? "" : "s"}
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
        <div className="rounded-xl border border-[#262626] bg-primary p-4">
          <div className="flex items-center gap-2">
            <p className="text-3xl font-semibold text-white">
              {(ratingsAverage || 0).toFixed(1)}
            </p>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <HiStar
                  key={i}
                  className={`w-4 h-4 ${
                    i <= Math.round(ratingsAverage || 0)
                      ? "text-accent"
                      : "text-[#262626]"
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-muted text-sm mt-1">
            Based on {ratingsCount || 0} review{(ratingsCount || 0) === 1 ? "" : "s"}
          </p>

          <div className="mt-4 space-y-2">
            {[5, 4, 3, 2, 1].map((n) => {
              const count = breakdown[n] || 0;
              const total = reviews.length || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={n} className="flex items-center gap-2">
                  <span className="text-xs text-muted w-10">{n}★</span>
                  <div className="flex-1 h-2 rounded-full bg-[#0f0f0f] border border-[#262626] overflow-hidden">
                    <div
                      className="h-full bg-accent"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted w-10 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          {(showAll ? sorted : sorted.slice(0, 3)).map((r) => (
            <div
              key={r._id}
              className="rounded-xl border border-[#262626] bg-primary p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    {r.user?.name || "Customer"}
                  </p>
                  <p className="text-muted text-xs mt-0.5">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <HiStar
                      key={i}
                      className={`w-4 h-4 ${
                        i <= Number(r.rating) ? "text-accent" : "text-[#262626]"
                      }`}
                    />
                  ))}
                </div>
              </div>
              {r.comment ? (
                <p className="text-white/90 text-sm mt-3 leading-relaxed">
                  {r.comment}
                </p>
              ) : null}
            </div>
          ))}
          {reviews.length === 0 && (
            <p className="text-muted text-sm">No reviews yet.</p>
          )}
        </div>
      </div>

      {user ? (
        <form onSubmit={submit} className="space-y-3 border-t border-[#262626] pt-6">
          <p className="text-white font-medium text-sm">Write a review</p>
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
            rows={3}
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-accent text-primary px-5 py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50 active:scale-95 transition-transform"
          >
            {submitting ? "Submitting…" : "Submit review"}
          </button>
        </form>
      ) : (
        <p className="text-muted text-sm">Sign in to write a review.</p>
      )}
    </section>
  );
}
