"use client";

import { useRouter } from "next/navigation";

export function LogoutButton({ fullName }: { fullName: string }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-full border border-blue-100 bg-white px-3 py-2 text-xs font-medium text-slate-600"
    >
      {fullName} · Logout
    </button>
  );
}
