import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import type { Role } from "@/lib/domain";

export function requirePageSession(allowedRoles?: Role[]) {
  const session = getSession();
  if (!session) {
    redirect("/login");
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    if (session.role === "ADMIN") {
      redirect("/admin/users");
    }
    redirect("/vote");
  }

  return session;
}
