import { formatCurrency } from "@/lib/money";
import type { SummaryRow } from "@/lib/types";

export function SummaryTable({ rows }: { rows: SummaryRow[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-slate-600">User</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-600">Phai nop</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-600">Da nop</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-600">Con no</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr
              key={row.userId}
              className={row.isTop ? "bg-amber-50/70" : "bg-white"}
              title={row.isTop ? "Top nhom dong tien nhieu" : ""}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 overflow-hidden rounded-full bg-slate-100">
                    {row.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={row.avatarUrl} alt={row.fullName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-500">
                        {row.fullName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="font-medium text-slate-800">{row.fullName}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatCurrency(row.amountDue)}</td>
              <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(row.amountPaid)}</td>
              <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(row.outstanding)}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td className="px-4 py-6 text-center text-slate-500" colSpan={4}>
                Chua co du lieu.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
