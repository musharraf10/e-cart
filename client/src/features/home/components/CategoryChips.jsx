export function CategoryChips({ categories = [], active, onSelect }) {
  if (!categories.length) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-text-muted">Browse categories</h2>
      <div className="-mx-4 overflow-x-auto px-4">
        <div className="flex gap-2 w-max">
          {categories.map((category) => {
            const isActive = active === category.slug;
            return (
              <button
                type="button"
                key={category._id}
                onClick={() => onSelect(isActive ? "" : category.slug)}
                className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
                  isActive
                    ? "bg-accent text-bg-primary border-accent"
                    : "border-border-subtle text-text-muted"
                }`}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
