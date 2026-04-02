const DEFAULT_REVIEWS = [
  { id: 1, quote: "Clean fits, fast delivery, and premium quality.", name: "Mia" },
  { id: 2, quote: "Exactly what I wanted from a minimal shopping app.", name: "Jordan" },
  { id: 3, quote: "Smooth checkout and great product finish.", name: "Alex" },
];

export function ReviewsSection({ reviews = DEFAULT_REVIEWS }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Reviews</h2>
      <div className="grid gap-2 md:grid-cols-3">
        {reviews.map((item) => (
          <article key={item.id} className="surface-card p-4">
            <p className="text-sm text-text-primary">“{item.quote}”</p>
            <p className="mt-2 text-xs text-text-muted">— {item.name}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
