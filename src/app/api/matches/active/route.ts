import { NextResponse } from "next/server";
import { requireApiSession } from "@/modules/auth/guards";
import { getVotesForActiveMatches } from "@/modules/votes/service";

export async function GET() {
  const guard = requireApiSession();
  if (!guard.ok) return guard.response;

  const matches = await getVotesForActiveMatches(guard.session.userId);
  return NextResponse.json({ matches });
}
