import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth";
import { badRequest, unauthorized } from "@/lib/http";
import { loginSchema } from "@/lib/validators";
import { loginWithPin } from "@/modules/auth/service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message || "Invalid payload");
    }

    const user = await loginWithPin(parsed.data.userId, parsed.data.pin);
    if (!user) {
      return unauthorized("Invalid user or PIN");
    }

    setSessionCookie({
      userId: user.id,
      role: user.role,
      fullName: user.fullName
    });

    return NextResponse.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch {
    return badRequest("Invalid JSON body");
  }
}
