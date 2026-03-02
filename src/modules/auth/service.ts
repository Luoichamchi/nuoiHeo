import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import type { Role } from "@/lib/domain";

export type AuthenticatedUser = {
  id: string;
  fullName: string;
  role: Role;
};

function toRole(value: string): Role {
  return value === "ADMIN" ? "ADMIN" : "MEMBER";
}

export async function loginWithPin(userId: string, pin: string): Promise<AuthenticatedUser | null> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || !user.isActive) return null;

  const isCorrect = await bcrypt.compare(pin, user.pinHash);
  if (!isCorrect) return null;

  return {
    id: user.id,
    fullName: user.fullName,
    role: toRole(user.role)
  };
}
