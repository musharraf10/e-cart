export function SizeChartModal({ open, onClose, sizeChart }) {
  if (!open) return null;

  const rows = sizeChart?.rows || [];
  const unit = sizeChart?.unit || "in";
  const notes = sizeChart?.notes || "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-2xl border border-[#303030] bg-[#121212] p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Size chart ({unit})</h3>
          <button type="button" onClick={onClose} className="rounded-lg border border-[#2b2b2b] px-3 py-1 text-sm text-muted hover:text-white">
            Close
          </button>
        </div>

        {rows.length === 0 ? (
          <p className="text-sm text-muted">Size chart is not available right now.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#262626]">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#1a1a1a] text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Chest</th>
                  <th className="px-4 py-3">Waist</th>
                  <th className="px-4 py-3">Hip</th>
                  <th className="px-4 py-3">Length</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.size} className="border-t border-[#262626] text-white">
                    <td className="px-4 py-2.5 font-semibold">{row.size}</td>
                    <td className="px-4 py-2.5">{row.chest ?? "—"}</td>
                    <td className="px-4 py-2.5">{row.waist ?? "—"}</td>
                    <td className="px-4 py-2.5">{row.hip ?? "—"}</td>
                    <td className="px-4 py-2.5">{row.length ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {notes ? <p className="mt-4 text-xs text-muted">{notes}</p> : null}
      </div>
    </div>
  );
}
