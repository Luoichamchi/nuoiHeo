import { SummaryPanel } from "@/components/forms/summary-panel";
import { requirePageSession } from "@/lib/page-auth";

export default function SummaryPage() {
  requirePageSession(["MEMBER"]);
  return <SummaryPanel />;
}
