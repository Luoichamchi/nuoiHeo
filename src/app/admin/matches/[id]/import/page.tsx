import { ImportVotesPanel } from "@/components/forms/import-votes-panel";
import { requirePageSession } from "@/lib/page-auth";

export default function ImportVotesPage({ params }: { params: { id: string } }) {
  requirePageSession(["ADMIN"]);

  return (
    <section className="space-y-4">
      <ImportVotesPanel matchId={params.id} />
    </section>
  );
}
