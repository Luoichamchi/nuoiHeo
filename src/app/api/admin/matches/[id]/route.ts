import { NextRequest, NextResponse } from "next/server";
import { badRequest, notFound } from "@/lib/http";
import { updateMatchSchema } from "@/lib/validators";
import { requireApiSession } from "@/modules/auth/guards";
import { updateMatch } from "@/modules/matches/service";

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  const guard = requireApiSession(["ADMIN"]);
  if (!guard.ok) return guard.response;

  try {
    const body = await request.json();
    const parsed = updateMatchSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message || "Invalid payload");
    }

    if (parsed.data.lockAt && parsed.data.startAt) {
      if (new Date(parsed.data.lockAt) < new Date(parsed.data.startAt)) {
        return badRequest("lockAt must be after or equal to startAt");
      }
    }

    const match = await updateMatch(context.params.id, parsed.data);
    return NextResponse.json({ match });
  } catch {
    return notFound("Match not found");
  }
}
