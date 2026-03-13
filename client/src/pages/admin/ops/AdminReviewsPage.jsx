import { useEffect, useState } from "react";
import api from "../../../api/client.js";

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const load = () => api.get("/admin/reviews").then(({ data }) => setReviews(data));
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Review Moderation</h1>
      {reviews.map((r) => (
        <div key={r._id} className="bg-white rounded-xl p-3 shadow-sm text-sm">
          <p className="font-medium">{r.user?.name} · {r.product?.name} · {r.rating}/5</p>
          <p className="text-xs text-gray-600">{r.comment || "No comment"}</p>
          <div className="mt-2 flex gap-2 text-xs">
            {r.isHidden ? (
              <button className="border rounded-full px-2 py-1" onClick={()=>api.patch(`/admin/reviews/${r._id}/unhide`).then(load)}>Unhide</button>
            ) : (
              <button className="border rounded-full px-2 py-1" onClick={()=>api.patch(`/admin/reviews/${r._id}/hide`).then(load)}>Hide</button>
            )}
            <button className="border rounded-full px-2 py-1" onClick={()=>api.delete(`/admin/reviews/${r._id}`).then(load)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
