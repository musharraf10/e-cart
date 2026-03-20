import { useEffect, useMemo, useState } from "react";
import { HiCheckCircle, HiChevronDown, HiChevronUp, HiOutlineThumbUp } from "react-icons/hi";
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

  const itemCountLabel = useMemo(() => {
    const count = items.length;
    return `${count} question${count === 1 ? "" : "s"}`;
  }, [items.length]);

  return (
    <section className="mt-8 rounded-2xl bg-[#171717] border border-[#262626] p-6 space-y-5 shadow-[0_10px_40px_rgba(0,0,0,0.18)]">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Questions & Answers</h3>
          <p className="text-muted text-sm mt-1">
            {itemCountLabel}. Ask about sizing, fabric, fit, or delivery.
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
        className="flex flex-col sm:flex-row gap-3"
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

      <div className="space-y-4">
        {loading && <p className="text-muted text-sm">Loading questions…</p>}
        {!loading && items.length === 0 && (
          <p className="text-muted text-sm">No questions yet. Be the first to ask.</p>
        )}
        {displayedItems.map((item) => {
          const isOpen = activeId === item._id;
          const hasLongQuestion = item.question?.length > 180;
          const shouldClamp = hasLongQuestion && !isOpen;
          return (
            <article
              key={item._id}
              className="rounded-2xl border border-[#2a2a2a] bg-gradient-to-b from-[#181818] to-[#121212] p-5"
            >
              <button
                type="button"
                onClick={() => setActiveId((prev) => (prev === item._id ? null : item._id))}
                className="w-full text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-2">
                    <p className={`text-white font-medium leading-6 ${shouldClamp ? "line-clamp-2" : ""}`}>
                      <span className="text-accent font-semibold mr-1">Q:</span>
                      {item.question}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                      <span>{item.askedBy || "Customer"}</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className="mt-1 text-muted">
                    {isOpen ? <HiChevronUp className="w-5 h-5" /> : <HiChevronDown className="w-5 h-5" />}
                  </span>
                </div>
              </button>

              <div className="mt-4 rounded-xl border border-[#2f2f2f] bg-[#1d1d1d] p-4">
                {item.answer ? (
                  <>
                    <p className={`text-sm leading-6 text-white/90 ${!isOpen && item.answer.length > 180 ? "line-clamp-3" : ""}`}>
                      <span className="text-accent font-semibold mr-1">A:</span>
                      {item.answer}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
                      <div className="flex flex-wrap items-center gap-2">
                        {item.verified && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-emerald-300 font-semibold">
                            <HiCheckCircle className="w-3.5 h-3.5" />
                            Verified answer
                          </span>
                        )}
                        {item.answeredBy && <span>Answered by {item.answeredBy}</span>}
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#323232] px-3 py-1.5 hover:border-accent/50 hover:text-white transition-colors"
                      >
                        <HiOutlineThumbUp className="w-4 h-4" />
                        Helpful
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <p className="text-muted text-sm">No answer yet.</p>
                    {user && isOpen && (
                      <div className="space-y-2">
                        <textarea
                          value={answerDraft}
                          onChange={(e) => setAnswerDraft(e.target.value)}
                          placeholder="Write an answer"
                          rows={3}
                          className="w-full rounded-xl border border-[#262626] bg-primary px-4 py-3 text-white text-sm placeholder-muted focus:outline-none focus:border-accent resize-none"
                        />
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            disabled={answerSubmitting}
                            onClick={async () => {
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
            </article>
          );
        })}
      </div>
    </section>
  );
}
