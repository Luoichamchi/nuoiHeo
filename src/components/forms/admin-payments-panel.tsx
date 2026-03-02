"use client";

import { FormEvent, useEffect, useState } from "react";
import { SummaryTable } from "@/components/tables/summary-table";
import { formatCurrency } from "@/lib/money";
import type { SummaryResponse } from "@/lib/types";

type UserItem = {
  id: string;
  fullName: string;
  role: "ADMIN" | "MEMBER";
};

type MatchItem = {
  id: string;
  title: string;
};

export function AdminPaymentsPanel() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [matchId, setMatchId] = useState("");
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState(10000);
  const [note, setNote] = useState("");

  async function loadData() {
    const [usersResponse, matchesResponse, summaryResponse] = await Promise.all([
      fetch("/api/admin/users", { cache: "no-store" }),
      fetch("/api/admin/matches", { cache: "no-store" }),
      fetch("/api/admin/summary", { cache: "no-store" })
    ]);

    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      setUsers((usersData.users as UserItem[]).filter((item) => item.id && item.role === "MEMBER"));
    }

    if (matchesResponse.ok) {
      const matchesData = await matchesResponse.json();
      setMatches(matchesData.matches as MatchItem[]);
    }

    if (summaryResponse.ok) {
      setSummary(await summaryResponse.json());
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!matchId && matches.length > 0) setMatchId(matches[0].id);
    if (!userId && users.length > 0) setUserId(users[0].id);
  }, [matches, users, matchId, userId]);

  async function recordPayment(event: FormEvent) {
    event.preventDefault();
    setMessage(null);

    const response = await fetch("/api/admin/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matchId,
        userId,
        amount,
        note,
        paidAt: new Date().toISOString()
      })
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Khong ghi nhan duoc payment");
      return;
    }

    setMessage("Da ghi nhan payment");
    setNote("");
    await loadData();
  }

  return (
    <section className="space-y-4">
      <div className="card p-4 sm:p-5">
        <h2 className="text-xl font-bold text-slate-900">Ghi nhan tien da nop</h2>
        <form onSubmit={recordPayment} className="mt-3 grid gap-3 md:grid-cols-4">
          <select value={matchId} onChange={(event) => setMatchId(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2">
            {matches.map((match) => (
              <option key={match.id} value={match.id}>
                {match.title}
              </option>
            ))}
          </select>

          <select value={userId} onChange={(event) => setUserId(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2">
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.fullName}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value))}
            className="rounded-xl border border-slate-200 px-3 py-2"
            min={1}
          />

          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2"
            placeholder="Ghi chu"
          />

          <button className="rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white md:col-span-4">Ghi nhan</button>
        </form>

        {message && <p className="mt-2 text-sm text-brand-700">{message}</p>}
      </div>

      {summary && (
        <div className="card p-4 sm:p-5">
          <h2 className="text-xl font-bold text-slate-900">Tong hop cong no</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-xs text-slate-500">Tong phai nop</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{formatCurrency(summary.totals.totalDue)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-xs text-slate-500">Tong da nop</p>
              <p className="mt-1 text-lg font-semibold text-emerald-700">{formatCurrency(summary.totals.totalPaid)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-xs text-slate-500">Tong con no</p>
              <p className="mt-1 text-lg font-semibold text-amber-700">{formatCurrency(summary.totals.totalOutstanding)}</p>
            </div>
          </div>

          <div className="mt-4">
            <SummaryTable rows={summary.tableRows} />
          </div>
        </div>
      )}
    </section>
  );
}
