import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { badRequest, notFound } from "@/lib/http";
import { requireApiSession } from "@/modules/auth/guards";
import { updateAvatar } from "@/modules/users/service";

const AVATAR_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(request: NextRequest, context: { params: { id: string } }) {
  const guard = requireApiSession(["ADMIN", "MEMBER"]);
  if (!guard.ok) return guard.response;

  const targetUserId = context.params.id;
  if (guard.session.role !== "ADMIN" && guard.session.userId !== targetUserId) {
    return badRequest("You can only update your own avatar");
  }

  const formData = await request.formData();
  const file = formData.get("avatar");

  if (!(file instanceof File)) {
    return badRequest("avatar file is required");
  }

  if (!file.type.startsWith("image/")) {
    return badRequest("Only image files are allowed");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length > 5 * 1024 * 1024) {
    return badRequest("Avatar file must be <= 5MB");
  }

  const extension = file.name.includes(".") ? file.name.split(".").pop() : "png";
  const filename = `${randomUUID()}.${extension}`;

  await mkdir(AVATAR_DIR, { recursive: true });
  await writeFile(path.join(AVATAR_DIR, filename), buffer);

  try {
    const user = await updateAvatar(targetUserId, `/uploads/${filename}`);
    return NextResponse.json({ user });
  } catch {
    return notFound("User not found");
  }
}
