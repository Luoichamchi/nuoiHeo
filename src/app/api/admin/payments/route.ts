import { NextRequest, NextResponse } from "next/server";
import { badRequest } from "@/lib/http";
import { paymentSchema } from "@/lib/validators";
import { requireApiSession } from "@/modules/auth/guards";
import { recordPayment } from "@/modules/settlement/service";

export async function POST(request: NextRequest) {
  const guard = requireApiSession(["ADMIN"]);
  if (!guard.ok) return guard.response;

  try {
    const body = await request.json();
    const parsed = paymentSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message || "Invalid payload");
    }

    const payment = await recordPayment({
      matchId: parsed.data.matchId,
      userId: parsed.data.userId,
      amount: parsed.data.amount,
      paidAt: parsed.data.paidAt ? new Date(parsed.data.paidAt) : undefined,
      note: parsed.data.note,
      recordedById: guard.session.userId
    });

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "USER_NOT_MEMBER") {
      return badRequest("Chi duoc ghi nhan payment cho MEMBER");
    }
    return badRequest("Unable to record payment");
  }
}
