"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/money";

type MatchResultType = "PENDING" | "A" | "B";

type MatchItem = {
  id: string;
  title: string;
  optionALabel: string;
  optionBLabel: string;
  penaltyAmount: number;
  startAt: string;
  lockAt: string;
  result: MatchResultType;
  createdBy: {
    id: string;
    fullName: string;
  };
};

export function AdminMatchesPanel() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [penaltyAmount, setPenaltyAmount] = useState(50000);
  const [startAt, setStartAt] = useState("");
  const [lockAt, setLockAt] = useState("");

  async function loadMatches() {
    const response = await fetch("/api/admin/matches", { cache: "no-store" });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Khong tai duoc matches");
      return;
    }

    setMatches(data.matches as MatchItem[]);
  }

  useEffect(() => {
    loadMatches();
  }, []);

  const ordered = useMemo(() => [...matches].sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()), [matches]);

  async function createMatch(event: FormEvent) {
    event.preventDefault();
    setMessage(null);

    const response = await fetch("/api/admin/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim() || `${optionA} vs ${optionB}`,
        optionALabel: optionA,
        optionBLabel: optionB,
        penaltyAmount,
        startAt: new Date(startAt).toISOString(),
        lockAt: new Date(lockAt).toISOString()
      })
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Tao match that bai");
      return;
    }

    setMessage("Da tao match");
    setTitle("");
    setOptionA("");
    setOptionB("");
    await loadMatches();
  }

  async function setResult(matchId: string, result: "A" | "B") {
    const response = await fetch(`/api/admin/matches/${matchId}/result`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result })
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Khong set duoc ket qua");
      return;
    }

    setMessage(`Da chot ket qua ${result}`);
    await loadMatches();
  }

  return (
    <section className="space-y-4">
      <div className="card p-4 sm:p-5">
        <h2 className="text-xl font-bold text-slate-900">Tao tran dau + luat</h2>
        <form onSubmit={createMatch} className="mt-3 grid gap-3 md:grid-cols-2">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Tieu de tran (co the de trong)"
            className="rounded-xl border border-slate-200 px-3 py-2"
          />
          <input
            type="number"
            value={penaltyAmount}
            onChange={(event) => setPenaltyAmount(Number(event.target.value))}
            className="rounded-xl border border-slate-200 px-3 py-2"
            required
          />
          <input
            value={optionA}
            onChange={(event) => setOptionA(event.target.value)}
            placeholder="Ten doi A"
            className="rounded-xl border border-slate-200 px-3 py-2"
            required
          />
          <input
            value={optionB}
            onChange={(event) => setOptionB(event.target.value)}
            placeholder="Ten doi B"
            className="rounded-xl border border-slate-200 px-3 py-2"
            required
          />
          <label className="text-sm text-slate-600">
            Start at (mo binh chon)
            <input
              type="datetime-local"
              value={startAt}
              onChange={(event) => setStartAt(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              required
            />
          </label>
          <label className="text-sm text-slate-600">
            Lock at (dong binh chon)
            <input
              type="datetime-local"
              value={lockAt}
              onChange={(event) => setLockAt(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
              required
            />
          </label>

          <button className="rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white md:col-span-2">Tao tran</button>
        </form>
      </div>

      <div className="card p-4 sm:p-5">
        <h2 className="text-xl font-bold text-slate-900">Danh sach tran</h2>
        {message && <p className="mt-2 text-sm text-brand-700">{message}</p>}

        <div className="mt-4 space-y-3">
          {ordered.map((match) => (
            <article key={match.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {match.optionALabel} vs {match.optionBLabel}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {match.title} · Phat {formatCurrency(match.penaltyAmount)} · Result: {match.result}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/matches/${match.id}/import`} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700">
                    Import CSV
                  </Link>
                  {match.result === "PENDING" && (
                    <>
                      <button onClick={() => setResult(match.id, "A")} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white">
                        Chot A
                      </button>
                      <button onClick={() => setResult(match.id, "B")} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white">
                        Chot B
                      </button>
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
