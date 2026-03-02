import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { badRequest } from "@/lib/http";
import { createUserSchema } from "@/lib/validators";
import { requireApiSession } from "@/modules/auth/guards";
import { createUser, listUsers } from "@/modules/users/service";

export async function GET() {
  const guard = requireApiSession(["ADMIN"]);
  if (!guard.ok) return guard.response;

  const users = await listUsers();
  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const guard = requireApiSession(["ADMIN"]);
  if (!guard.ok) return guard.response;

  try {
    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message || "Invalid payload");
    }

    const user = await createUser(parsed.data);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return badRequest("userId da ton tai, vui long chon userId khac");
    }
    return badRequest("Unable to create user");
  }
}
