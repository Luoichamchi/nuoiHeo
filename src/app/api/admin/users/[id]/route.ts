import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { badRequest, notFound } from "@/lib/http";
import { updateUserSchema } from "@/lib/validators";
import { requireApiSession } from "@/modules/auth/guards";
import { deleteUser, updateUser } from "@/modules/users/service";

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  const guard = requireApiSession(["ADMIN"]);
  if (!guard.ok) return guard.response;

  try {
    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message || "Invalid payload");
    }

    const user = await updateUser(context.params.id, parsed.data);
    return NextResponse.json({ user });
  } catch {
    return notFound("User not found");
  }
}

export async function DELETE(_: NextRequest, context: { params: { id: string } }) {
  const guard = requireApiSession(["ADMIN"]);
  if (!guard.ok) return guard.response;

  if (guard.session.userId === context.params.id) {
    return badRequest("Khong the tu xoa tai khoan admin dang dang nhap");
  }

  try {
    const deleted = await deleteUser(context.params.id);
    return NextResponse.json({ deleted });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return badRequest("Khong the xoa user nay vi da co du lieu lien quan (match/payment/import)");
    }
    return notFound("User not found");
  }
}
