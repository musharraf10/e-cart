import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
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

  const breakdown = useMemo(() => {
    const map = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      map[r.rating] += 1;
    });
    return map;
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
    <div className="mt-8 rounded-xl bg-[#171717] border border-[#262626] p-6 space-y-6">
      <h3 className="text-lg font-semibold text-white">Customer Reviews</h3>
      <div className="grid md:grid-cols-[200px,1fr] gap-6">
        <div>
          <p className="text-3xl font-semibold text-white">
            {(ratingsAverage || 0).toFixed(1)}
          </p>
          <p className="text-muted text-sm">{ratingsCount || 0} reviews</p>
          <div className="mt-3 space-y-1 text-xs text-muted">
            {[5, 4, 3, 2, 1].map((n) => (
              <p key={n}>
                {n}★: {breakdown[n]}
              </p>
            ))}
          </div>
        </div>
        <div className="space-y-3 max-h-64 overflow-auto">
          {[...reviews].sort((a, b) => b.rating - a.rating).slice(0, 4).map((r) => (
            <div
              key={r._id}
              className="rounded-lg border border-[#262626] p-4"
            >
              <p className="text-white font-medium text-sm">
                {r.user?.name || "Customer"} · {r.rating}★
              </p>
              <p className="text-muted text-xs mt-0.5">
                {new Date(r.createdAt).toLocaleDateString()}
              </p>
              <p className="text-muted text-sm mt-2">{r.comment}</p>
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
            className="rounded-xl bg-accent text-primary px-5 py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit review"}
          </button>
        </form>
      ) : (
        <p className="text-muted text-sm">Sign in to write a review.</p>
      )}
    </div>
  );
}
