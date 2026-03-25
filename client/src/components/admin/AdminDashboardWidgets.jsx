import { FiArrowUpRight } from "react-icons/fi";

function parseSeries(rows, valueKey) {
  return (rows || []).map((row, index) => ({
    label: row._id || `#${index + 1}`,
    value: Number(row[valueKey]) || 0,
  }));
}

export function AdminMetricCard({ label, value, highlight = false, detail }) {
  return (
    <article
      className={`rounded-2xl border p-5 transition-transform duration-200 hover:-translate-y-0.5 ${
        highlight
          ? "border-accent/40 bg-gradient-to-br from-accent/15 via-card to-card"
          : "border-border bg-card"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
      {detail ? <p className="mt-2 text-xs text-muted">{detail}</p> : null}
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
  const series = parseSeries(rows, valueKey);
  const max = Math.max(...series.map((row) => row.value), 0);

  if (!series.length) {
    return <p className="py-8 text-center text-sm text-muted">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-3">
      {series.map((row) => {
        const pct = max > 0 ? Math.max((row.value / max) * 100, 6) : 0;
        return (
          <div key={row.label} className="rounded-xl border border-border/80 bg-primary/50 px-3 py-2.5 text-sm">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-muted">{row.label}</span>
              <span className="font-medium text-white">{valueFormatter(row.value)}</span>
            </div>
            <div className="h-1.5 rounded-full bg-border/80">
              <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AdminLineChart({ rows, valueKey, valueFormatter, emptyMessage }) {
  const series = parseSeries(rows, valueKey);
  if (!series.length) {
    return <p className="py-8 text-center text-sm text-muted">{emptyMessage}</p>;
  }

  const width = 640;
  const height = 220;
  const padding = 26;
  const max = Math.max(...series.map((point) => point.value), 1);
  const step = series.length > 1 ? (width - padding * 2) / (series.length - 1) : 0;

  const points = series
    .map((point, index) => {
      const x = padding + step * index;
      const y = height - padding - (point.value / max) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const area = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-52 min-w-[560px] w-full" role="img" aria-label="Trend chart">
          <defs>
            <linearGradient id="lineChartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a6c655" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#a6c655" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline points={area} fill="url(#lineChartFill)" stroke="none" />
          <polyline points={points} fill="none" stroke="#a6c655" strokeWidth="3" strokeLinejoin="round" />
          {series.map((point, index) => {
            const x = padding + step * index;
            const y = height - padding - (point.value / max) * (height - padding * 2);
            return <circle key={point.label} cx={x} cy={y} r="3.5" fill="#d9ec8e" />;
          })}
        </svg>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-muted sm:grid-cols-4">
        {series.slice(-4).map((point) => (
          <div key={point.label} className="rounded-lg border border-border/80 bg-primary/40 px-2 py-1.5">
            <p>{point.label}</p>
            <p className="font-semibold text-white">{valueFormatter(point.value)}</p>
          </div>
        ))}
      </div>
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
