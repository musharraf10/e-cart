import { FiArrowUpRight } from "react-icons/fi";

export function AdminMetricCard({ label, value, highlight = false }) {
  return (
    <article
      className={`rounded-2xl border p-5 transition-transform duration-200 hover:-translate-y-0.5 ${
        highlight
          ? "border-accent/40 bg-gradient-to-br from-accent/10 via-card to-card"
          : "border-border bg-card"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
    </article>
  );
}

export function AdminPanelCard({ title, subtitle, action, children }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
        </div>
        {action ? action : null}
      </div>
      {children}
    </section>
  );
}

export function AdminTrendList({ rows, valueFormatter, valueKey, emptyMessage }) {
  if (!rows?.length) {
    return <p className="py-8 text-center text-sm text-muted">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div
          key={row._id}
          className="flex items-center justify-between rounded-xl border border-border/80 bg-primary/40 px-3 py-2 text-sm"
        >
          <span className="text-muted">{row._id}</span>
          <span className="font-medium text-white">{valueFormatter(row[valueKey])}</span>
        </div>
      ))}
    </div>
  );
}

export function RecentOrderRow({ order, formatCurrency }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border/80 bg-primary/40 px-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium text-white">
          #{order._id.slice(-6).toUpperCase()} · {order.user?.name || "Guest"}
        </p>
        <p className="text-xs text-muted">
          {new Date(order.createdAt).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>
      <div className="text-left sm:text-right">
        <p className="font-semibold text-white">{formatCurrency(order.total)}</p>
        <p className="text-xs capitalize text-muted">{order.status}</p>
      </div>
    </div>
  );
}

export function ActivityItem({ children }) {
  return (
    <div className="flex items-start justify-between rounded-xl border border-border/80 bg-primary/40 px-3 py-2 text-sm text-muted">
      <span>{children}</span>
      <FiArrowUpRight className="mt-0.5 shrink-0 text-accent" />
    </div>
  );
}
