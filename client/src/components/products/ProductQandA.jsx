import { useEffect, useState } from "react";
import { HiCheckCircle, HiChevronDown, HiChevronUp } from "react-icons/hi";
import api from "../../api/client.js";
import { useToast } from "../ui/ToastProvider.jsx";
import { useSelector } from "react-redux";

export function ProductQandA({ productId }) {
  const { notify } = useToast();
  const user = useSelector((s) => s.auth.user);
  const isAdmin = user?.role === "admin";

  const [question, setQuestion] = useState("");
  const [items, setItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [answerDraft, setAnswerDraft] = useState("");
  const [answerSubmitting, setAnswerSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get(`/products/${productId}/questions`)
      .then(({ data }) => {
        if (mounted) setItems(data || []);
      })
      .catch(() => {
        if (mounted) setItems([]);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [productId]);

  const displayedItems = expanded ? items : items.slice(0, 3);

  const openItem = items.find((i) => i._id === activeId) || null;

  useEffect(() => {
    if (!openItem) return;
    setAnswerDraft(openItem.answer || "");
  }, [activeId, openItem?.answer]);

  return (
    <section className="mt-8 rounded-xl bg-[#171717] border border-[#262626] p-6 space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Questions & Answers</h3>
          <p className="text-muted text-sm mt-1">
            Ask about sizing, fabric, fit, or delivery.
          </p>
        </div>
        {items.length > 3 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-sm text-accent font-medium inline-flex items-center gap-1 active:scale-95 transition-transform"
          >
            {expanded ? "Show less" : "Show more"}
            {expanded ? (
              <HiChevronUp className="w-4 h-4" />
            ) : (
              <HiChevronDown className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!question.trim()) return;
          if (!user) {
            notify("Please sign in to ask a question.", "error");
            return;
          }
          api
            .post(`/products/${productId}/questions`, { question })
            .then(({ data }) => {
              setItems((prev) => [data, ...prev]);
              setQuestion("");
              notify("Question submitted.");
            })
            .catch(() => {
              notify("Unable to submit question", "error");
            });
        }}
        className="flex gap-3"
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about this product"
          className="flex-1 h-12 rounded-xl border border-[#262626] bg-primary px-4 text-white text-sm placeholder-muted focus:outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="h-12 px-5 rounded-xl bg-accent text-primary text-sm font-semibold active:scale-95 transition-transform"
        >
          Ask
        </button>
      </form>

      <div className="space-y-3">
        {loading && <p className="text-muted text-sm">Loading questions…</p>}
        {!loading && items.length === 0 && (
          <p className="text-muted text-sm">No questions yet. Be the first to ask.</p>
        )}
        {displayedItems.map((item) => {
          const isOpen = activeId === item._id;
          return (
            <div
              key={item._id}
              role="button"
              tabIndex={0}
              onClick={() => setActiveId((prev) => (prev === item._id ? null : item._id))}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveId((prev) => (prev === item._id ? null : item._id));
                }
              }}
              className="w-full text-left rounded-xl border border-[#262626] bg-primary p-4 active:scale-95 transition-transform"
            >
              <p className="text-white font-medium">
                Q: <span className="font-semibold">{item.question}</span>
              </p>
              {!isOpen && item.answer && (
                <div className="mt-2 space-y-1">
                  <p className="text-muted text-sm">
                    A: <span className="text-white/90">{item.answer}</span>
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    {item.verified && (
                      <span className="inline-flex items-center gap-1 text-accent">
                        <HiCheckCircle className="w-4 h-4" />
                        Verified
                      </span>
                    )}
                    {item.answeredBy && (
                      <span className="capitalize">{item.answeredBy}</span>
                    )}
                  </div>
                </div>
              )}
              {isOpen && (
                <div className="mt-2">
                  {item.answer ? (
                    <>
                      <p className="text-muted">
                        A: <span className="text-white/90">{item.answer}</span>
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                        {item.verified && (
                          <span className="inline-flex items-center gap-1 text-accent">
                            <HiCheckCircle className="w-4 h-4" />
                            Verified
                          </span>
                        )}
                        {item.answeredBy && <span className="capitalize">{item.answeredBy}</span>}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-muted text-sm">No answer yet.</p>
                      {user && (
                        <div className="space-y-2">
                          <textarea
                            value={answerDraft}
                            onChange={(e) => setAnswerDraft(e.target.value)}
                            placeholder="Write an answer"
                            rows={3}
                            className="w-full rounded-xl border border-[#262626] bg-primary px-4 py-3 text-white text-sm placeholder-muted focus:outline-none focus:border-accent resize-none"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={answerSubmitting}
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (!answerDraft.trim()) return;
                                try {
                                  setAnswerSubmitting(true);
                                  const endpoint = isAdmin
                                    ? `/admin/questions/${item._id}/answer`
                                    : `/products/questions/${item._id}/answer`;
                                  const { data } = await api.patch(endpoint, {
                                    answer: answerDraft,
                                  });

                                  setItems((prev) =>
                                    prev.map((q) =>
                                      String(q._id) === String(data._id) ? data : q,
                                    ),
                                  );
                                  notify("Answer submitted.");
                                } catch {
                                  notify("Unable to submit answer", "error");
                                } finally {
                                  setAnswerSubmitting(false);
                                }
                              }}
                              className="rounded-xl bg-accent text-primary px-4 py-2 text-sm font-semibold hover:opacity-90 active:scale-95 transition-transform disabled:opacity-60"
                            >
                              {answerSubmitting ? "Submitting…" : "Submit answer"}
                            </button>
                            {isAdmin && (
                              <span className="text-[11px] text-muted">
                                Admin answers get a Verified badge.
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

