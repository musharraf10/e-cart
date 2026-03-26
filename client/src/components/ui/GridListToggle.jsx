import { HiOutlineViewGrid, HiOutlineViewList } from "react-icons/hi";

export function GridListToggle({ viewMode, onChange }) {
  return (
    <div className="inline-flex rounded-xl border border-border bg-card p-1">
      <button
        type="button"
        onClick={() => onChange("grid")}
        className={`rounded-lg px-3 py-2 text-sm transition-colors ${viewMode === "grid" ? "bg-accent text-primary" : "text-muted hover:text-white"}`}
        aria-label="Grid view"
      >
        <HiOutlineViewGrid className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onChange("list")}
        className={`rounded-lg px-3 py-2 text-sm transition-colors ${viewMode === "list" ? "bg-accent text-primary" : "text-muted hover:text-white"}`}
        aria-label="List view"
      >
        <HiOutlineViewList className="h-4 w-4" />
      </button>
    </div>
  );
}
