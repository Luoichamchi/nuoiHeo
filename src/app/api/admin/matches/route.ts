import { NextRequest, NextResponse } from "next/server";
import { badRequest } from "@/lib/http";
import { createMatchSchema } from "@/lib/validators";
import { requireApiSession } from "@/modules/auth/guards";
import { createMatch, listMatches } from "@/modules/matches/service";

export async function GET() {
  const guard = requireApiSession(["ADMIN"]);
  if (!guard.ok) return guard.response;

  const matches = await listMatches();
  return NextResponse.json({ matches });
}

export async function POST(request: NextRequest) {
  const guard = requireApiSession(["ADMIN"]);
  if (!guard.ok) return guard.response;

  try {
    const body = await request.json();
    const parsed = createMatchSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message || "Invalid payload");
    }

    if (new Date(parsed.data.lockAt) < new Date(parsed.data.startAt)) {
      return badRequest("lockAt must be after or equal to startAt");
    }

    const match = await createMatch(parsed.data, guard.session.userId);
    return NextResponse.json({ match }, { status: 201 });
  } catch {
    return badRequest("Unable to create match");
  }
}
