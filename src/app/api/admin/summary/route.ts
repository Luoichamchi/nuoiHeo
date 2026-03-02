import { NextRequest, NextResponse } from "next/server";
import { requireApiSession } from "@/modules/auth/guards";
import { buildAdminSummary } from "@/modules/summary/service";

export async function GET(request: NextRequest) {
  const guard = requireApiSession(["ADMIN"]);
  if (!guard.ok) return guard.response;

  const matchId = request.nextUrl.searchParams.get("matchId") ?? undefined;
  const summary = await buildAdminSummary(matchId);

  return NextResponse.json(summary);
}
