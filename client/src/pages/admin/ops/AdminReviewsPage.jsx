import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../../api/client.js";

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const load = () => api.get("/admin/reviews").then(({ data }) => setReviews(data));
  useEffect(() => { load(); }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight text-white">Review Moderation</h1>
      {reviews.length === 0 ? (
        <div className="rounded-xl bg-card border border-[#262626] py-12 text-center text-muted">No reviews yet.</div>
      ) : (
        reviews.map((r) => (
          <div key={r._id} className="bg-card rounded-xl border border-[#262626] p-4 text-sm">
            <p className="font-medium text-white">{r.user?.name} · {r.product?.name} · {r.rating}/5</p>
            <p className="text-xs text-muted mt-1">{r.comment || "No comment"}</p>
            <div className="mt-3 flex gap-2 text-xs">
              {r.isHidden ? (
                <button className="rounded-lg border border-[#262626] px-3 py-1.5 text-white hover:bg-[#262626]" onClick={() => api.patch(`/admin/reviews/${r._id}/unhide`).then(load)}>Unhide</button>
              ) : (
                <button className="rounded-lg border border-[#262626] px-3 py-1.5 text-white hover:bg-[#262626]" onClick={() => api.patch(`/admin/reviews/${r._id}/hide`).then(load)}>Hide</button>
              )}
              <button className="rounded-lg border border-red-900/50 px-3 py-1.5 text-red-400 hover:bg-red-900/20" onClick={() => api.delete(`/admin/reviews/${r._id}`).then(load)}>Delete</button>
            </div>
          </div>
        ))
      )}
    </motion.div>
  );
}
