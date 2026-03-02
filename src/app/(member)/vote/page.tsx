import { VotePanel } from "@/components/forms/vote-panel";
import { requirePageSession } from "@/lib/page-auth";

export default function VotePage() {
  requirePageSession(["MEMBER"]);

  return (
    <section className="space-y-4">
      <div className="card p-4 sm:p-5">
        <h1 className="text-2xl font-bold text-slate-900">Binh chon</h1>
        <p className="mt-1 text-sm text-slate-600">Moi tran co 2 lua chon A/B, sai thi dong tien theo luat tran.</p>
      </div>
      <VotePanel />
    </section>
  );
}
