export function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <div className="rounded-xl border border-[#262626] bg-[#171717] p-5">
        <h1 className="text-xl font-semibold text-white">Terms & Conditions</h1>
        <p className="mt-2 text-sm text-muted">
          Please review these terms before placing an order with NoorFit.
        </p>

        <ul className="mt-4 space-y-3 text-sm text-muted list-disc pl-5">
          <li>Orders are confirmed only after successful payment verification.</li>
          <li>Pricing may change without notice, but confirmed orders keep checkout pricing.</li>
          <li>Cancellations are allowed before dispatch; shipped orders follow return policy.</li>
          <li>Any misuse, fraud, or policy abuse may lead to account restrictions.</li>
        </ul>

        <p className="mt-5 text-xs text-muted">Last updated: March 26, 2026</p>
      </div>
    </div>
  );
}
