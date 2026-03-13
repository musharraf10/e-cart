import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../api/client.js";

export function ProductReviews({ productId, reviews, setReviews, ratingsAverage, ratingsCount }) {
  const user = useSelector((s) => s.auth.user);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const breakdown = useMemo(() => {
    const map = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => { map[r.rating] += 1; });
    return map;
  }, [reviews]);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/reviews/${productId}`, { rating: Number(rating), comment });
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
    <div className="bg-white rounded-xl shadow-sm p-4 text-sm space-y-4">
      <h3 className="font-semibold">Customer Reviews</h3>
      <div className="grid md:grid-cols-[200px,1fr] gap-4">
        <div>
          <p className="text-3xl font-semibold">{(ratingsAverage || 0).toFixed(1)}</p>
          <p className="text-xs text-gray-500">{ratingsCount || 0} reviews</p>
          <div className="mt-2 space-y-1 text-xs">
            {[5,4,3,2,1].map((n)=><p key={n}>{n}★: {breakdown[n]}</p>)}
          </div>
        </div>
        <div className="space-y-2 max-h-64 overflow-auto">
          {reviews.map((r) => (
            <div key={r._id} className="border rounded-lg p-3">
              <p className="font-medium">{r.user?.name || "Customer"} · {r.rating}★</p>
              <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</p>
              <p className="mt-1">{r.comment}</p>
            </div>
          ))}
          {reviews.length === 0 && <p className="text-xs text-gray-500">No reviews yet.</p>}
        </div>
      </div>

      {user ? (
        <form onSubmit={submit} className="space-y-2 border-t pt-3">
          <p className="font-medium">Write a review</p>
          <select className="border rounded-lg px-3 py-2" value={rating} onChange={(e)=>setRating(e.target.value)}>
            {[5,4,3,2,1].map((n)=><option key={n} value={n}>{n} Stars</option>)}
          </select>
          <textarea className="w-full border rounded-lg px-3 py-2" placeholder="Share your feedback" value={comment} onChange={(e)=>setComment(e.target.value)} />
          <button disabled={submitting} className="px-4 py-2 rounded-full bg-gray-900 text-white text-xs">{submitting ? "Submitting..." : "Submit review"}</button>
        </form>
      ) : (
        <p className="text-xs text-gray-500">Sign in to write a review.</p>
      )}
    </div>
  );
}
