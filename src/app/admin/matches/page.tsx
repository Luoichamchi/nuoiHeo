import { AdminMatchesPanel } from "@/components/forms/admin-matches-panel";
import { requirePageSession } from "@/lib/page-auth";

export default function AdminMatchesPage() {
  requirePageSession(["ADMIN"]);
  return (
    <section className="space-y-4">
      <div className="card p-4 sm:p-5">
        <h1 className="text-2xl font-bold text-slate-900">Quan ly Matches</h1>
        <p className="mt-1 text-sm text-slate-600">Tao tran, dat luat phat, chot ket qua va import vote.</p>
      </div>
      <AdminMatchesPanel />
    </section>
  );
}
