import { NextResponse } from "next/server";
import { requireApiSession } from "@/modules/auth/guards";
import { listActiveMatches } from "@/modules/matches/service";
import { getVotesForActiveMatches } from "@/modules/votes/service";

export async function GET() {
  const guard = requireApiSession();
  if (!guard.ok) return guard.response;

  const [matches, withVotes] = await Promise.all([
    listActiveMatches(),
    getVotesForActiveMatches(guard.session.userId)
  ]);

  const voteMap = new Map(withVotes.map((item) => [item.id, item.myVote]));
  const data = matches.map((match) => ({
    ...match,
    myVote: voteMap.get(match.id) ?? null
  }));

  return NextResponse.json({ matches: data });
}
