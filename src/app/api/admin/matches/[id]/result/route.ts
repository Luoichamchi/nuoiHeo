import { NextRequest, NextResponse } from "next/server";
import { badRequest, notFound } from "@/lib/http";
import { setResultSchema } from "@/lib/validators";
import { requireApiSession } from "@/modules/auth/guards";
import { getMatchById, setMatchResult } from "@/modules/matches/service";
import { recalculateMatchCharges } from "@/modules/settlement/service";

export async function POST(request: NextRequest, context: { params: { id: string } }) {
  const guard = requireApiSession(["ADMIN"]);
  if (!guard.ok) return guard.response;

  const match = await getMatchById(context.params.id);
  if (!match) return notFound("Match not found");

  try {
    const body = await request.json();
    const parsed = setResultSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message || "Invalid payload");
    }

    if (match.result !== "PENDING") {
      return badRequest("Result already set. Update match manually if needed.");
    }

    const updated = await setMatchResult(context.params.id, parsed.data.result);
    const charges = await recalculateMatchCharges(context.params.id);

    return NextResponse.json({ match: updated, chargesUpdated: charges.length });
  } catch {
    return badRequest("Unable to set result");
  }
}
