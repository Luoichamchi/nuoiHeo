import { NextRequest, NextResponse } from "next/server";
import { requireApiSession } from "@/modules/auth/guards";
import { buildSummary } from "@/modules/summary/service";

export async function GET(request: NextRequest) {
  const guard = requireApiSession();
  if (!guard.ok) return guard.response;

  const search = request.nextUrl.searchParams;
  const scope = search.get("scope") === "match" ? "match" : "all";
  const matchId = search.get("matchId") || undefined;
  const metric = search.get("metric") === "outstanding" ? "outstanding" : "due";

  const summary = await buildSummary({
    scope,
    matchId,
    metric
  });

  return NextResponse.json(summary);
}
