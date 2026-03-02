import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { unauthorized } from "@/lib/http";

export async function GET() {
  const session = getSession();
  if (!session) return unauthorized();

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      fullName: true,
      avatarUrl: true,
      role: true,
      isActive: true
    }
  });

  if (!user || !user.isActive) {
    return unauthorized();
  }

  return NextResponse.json({ user });
}
