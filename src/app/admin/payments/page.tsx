import { AdminPaymentsPanel } from "@/components/forms/admin-payments-panel";
import { requirePageSession } from "@/lib/page-auth";

export default function AdminPaymentsPage() {
  requirePageSession(["ADMIN"]);

  return (
    <section className="space-y-4">
      <div className="card p-4 sm:p-5">
        <h1 className="text-2xl font-bold text-slate-900">Quan ly Payments</h1>
        <p className="mt-1 text-sm text-slate-600">Ghi nhan thanh toan, theo doi cong no toan bo.</p>
      </div>
      <AdminPaymentsPanel />
    </section>
  );
}
