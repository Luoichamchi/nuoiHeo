"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, pin })
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Dang nhap that bai");
      setIsLoading(false);
      return;
    }

    if (data.user.role === "ADMIN") {
      router.push("/admin/users");
    } else {
      router.push("/vote");
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <label className="block text-sm font-medium text-slate-700">
        User ID
        <input
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-brand-300 focus:ring"
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
          required
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        PIN
        <input
          type="password"
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none ring-brand-300 focus:ring"
          value={pin}
          onChange={(event) => setPin(event.target.value)}
          required
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {isLoading ? "Dang xu ly..." : "Dang nhap"}
      </button>
    </form>
  );
}
