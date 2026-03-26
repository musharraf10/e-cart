export function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <div className="rounded-xl border border-[#262626] bg-[#171717] p-5">
        <h1 className="text-xl font-semibold text-white">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted">
          Your trust matters. We keep your data protected and only use it to improve your shopping experience.
        </p>

        <ul className="mt-4 space-y-3 text-sm text-muted list-disc pl-5">
          <li>We do not sell personal data to third parties.</li>
          <li>Payments are handled through secure, encrypted payment gateways.</li>
          <li>You can request updates, corrections, or deletion of account data.</li>
          <li>We use limited analytics to improve performance and service quality.</li>
        </ul>
      </div>
    </div>
  );
}
