const supportItems = [
  {
    title: "Email",
    value: "support@noorfit.com",
    note: "Best for order updates, returns, and account support.",
  },
  {
    title: "Phone",
    value: "+1 (800) 555-0198",
    note: "For urgent requests and delivery assistance.",
  },
  {
    title: "Support Hours",
    value: "Mon - Sat, 9:00 AM - 7:00 PM",
    note: "Responses usually arrive within a few business hours.",
  },
];

export function SupportPage() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6">
      <h1 className="text-xl font-semibold text-white">Support</h1>
      <p className="mt-2 text-sm text-muted">We are here to help with anything you need.</p>

      <div className="mt-4 space-y-3">
        {supportItems.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-[#262626] bg-[#171717] p-4 transition-colors hover:border-accent/30"
          >
            <p className="text-sm font-medium text-white">{item.title}</p>
            <p className="mt-1 text-sm text-muted">{item.value}</p>
            <p className="mt-2 text-xs text-muted">{item.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
