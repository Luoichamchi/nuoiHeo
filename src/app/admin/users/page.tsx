import { AdminUsersPanel } from "@/components/forms/admin-users-panel";
import { requirePageSession } from "@/lib/page-auth";

export default function AdminUsersPage() {
  requirePageSession(["ADMIN"]);
  return (
    <section className="space-y-4">
      <div className="card p-4 sm:p-5">
        <h1 className="text-2xl font-bold text-slate-900">Quan ly Users</h1>
        <p className="mt-1 text-sm text-slate-600">Tao user, cap nhat role/active, reset PIN.</p>
      </div>
      <AdminUsersPanel />
    </section>
  );
}
