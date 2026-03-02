import { NextRequest, NextResponse } from "next/server";
import { badRequest, notFound } from "@/lib/http";
import { voteSchema } from "@/lib/validators";
import { requireApiSession } from "@/modules/auth/guards";
import { upsertVote } from "@/modules/votes/service";

export async function POST(request: NextRequest, context: { params: { id: string } }) {
  const guard = requireApiSession();
  if (!guard.ok) return guard.response;

  try {
    const body = await request.json();
    const parsed = voteSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message || "Invalid payload");
    }

    const vote = await upsertVote({
      matchId: context.params.id,
      userId: guard.session.userId,
      choice: parsed.data.choice,
      updatedById: guard.session.userId
    });

    return NextResponse.json({ vote });
  } catch (error) {
    if (error instanceof Error && error.message === "MATCH_NOT_FOUND") {
      return notFound("Match not found");
    }
    if (error instanceof Error && error.message === "MATCH_CLOSED") {
      return badRequest("Match da co ket qua, khong the binh chon");
    }
    if (error instanceof Error && error.message === "VOTE_LOCKED") {
      return badRequest("Voting is locked for this match");
    }
    return badRequest("Unable to submit vote");
  }
}
