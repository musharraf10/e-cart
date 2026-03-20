import { Link, useSearchParams } from "react-router-dom";

export function CancelPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 text-center shadow-card">
      <p className="text-sm uppercase tracking-[0.25em] text-accent">Payment update</p>
      <h1 className="mt-3 text-3xl font-semibold text-white">Payment cancelled</h1>
      <p className="mt-4 text-sm text-muted">
        Your order is still saved as pending. You can return to checkout or retry payment from your orders.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link to="/checkout" className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-primary">
          Back to checkout
        </Link>
        <Link to={orderId ? `/account/orders/${orderId}` : "/account/orders"} className="rounded-xl border border-border px-5 py-3 text-sm font-semibold text-white">
          View order
        </Link>
      </div>
    </div>
  );
}
