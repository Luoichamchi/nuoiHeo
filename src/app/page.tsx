import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default function HomePage() {
  const session = getSession();
  if (!session) {
    redirect("/login");
  }

  if (session.role === "ADMIN") {
    redirect("/admin/users");
  }

  redirect("/vote");
}
