import type { Role } from "@/lib/domain";
import { getSession, hasRole } from "@/lib/auth";
import { forbidden, unauthorized } from "@/lib/http";

export type GuardResult =
  | { ok: true; session: { userId: string; role: Role; fullName: string; exp: number } }
  | { ok: false; response: ReturnType<typeof unauthorized> };

export function requireApiSession(allowedRoles?: Role[]): GuardResult {
  const session = getSession();
  if (!session) {
    return { ok: false, response: unauthorized() };
  }

  if (allowedRoles && !hasRole(session.role, allowedRoles)) {
    return { ok: false, response: forbidden() };
  }

  return { ok: true, session };
}
