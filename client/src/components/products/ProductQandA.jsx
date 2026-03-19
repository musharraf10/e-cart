import { useEffect, useState } from "react";
import { HiCheckCircle } from "react-icons/hi";
import api from "../../api/client.js";
import { useToast } from "../ui/ToastProvider.jsx";

export function ProductQandA({ productId }) {
  const { notify } = useToast();
  const [question, setQuestion] = useState("");
  const [items, setItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <section className="mt-8 rounded-xl bg-[#171717] border border-[#262626] p-6 space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Questions & Answers</h3>
          <p className="text-muted text-sm mt-1">
            Ask about sizing, fabric, fit, or delivery.
          </p>
        </div>
        {items.length > 2 && (
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
          api
            .post(`/products/${productId}/questions`, { question })
            .then(({ data }) => {
              setItems((prev) => [data, ...prev]);
              setQuestion("");
              notify("Question submitted (pending verification).");
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
        {items.map((item) => {
          const isOpen = activeId === item._id;
          return (
            <button
              key={item._id}
              type="button"
              onClick={() => setActiveId((prev) => (prev === item._id ? null : item._id))}
              className="w-full text-left rounded-xl border border-[#262626] bg-primary p-4 active:scale-95 transition-transform"
            >
              <p className="text-white font-medium">
                Q: <span className="font-semibold">{item.question}</span>
              </p>
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
                        {item.answeredBy && <span>{item.answeredBy}</span>}
                      </div>
                    </>
                  ) : (
                    <p className="text-muted text-sm">No answer yet.</p>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

