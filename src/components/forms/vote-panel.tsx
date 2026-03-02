"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/money";
import type { ActiveMatchItem } from "@/lib/types";

type ChoiceMap = Record<string, "A" | "B" | "">;

export function VotePanel() {
  const [matches, setMatches] = useState<ActiveMatchItem[]>([]);
  const [choices, setChoices] = useState<ChoiceMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function loadMatches() {
    setIsLoading(true);
    const response = await fetch("/api/matches/active", { cache: "no-store" });
    const data = await response.json();
    if (response.ok) {
      const items = data.matches as ActiveMatchItem[];
      setMatches(items);

      const next: ChoiceMap = {};
      items.forEach((item) => {
        next[item.id] = item.myVote?.choice ?? "";
      });
      setChoices(next);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    loadMatches();
  }, []);

  const sorted = useMemo(
    () => [...matches].sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()),
    [matches]
  );

  async function submitVote(matchId: string) {
    setFeedback(null);
    const choice = choices[matchId];
    if (!choice) {
      setFeedback("Vui long chon A hoac B truoc khi gui.");
      return;
    }

    const response = await fetch(`/api/matches/${matchId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ choice })
    });

    const data = await response.json();
    if (!response.ok) {
      setFeedback(data.error || "Gui binh chon that bai");
      return;
    }

    setFeedback("Da ghi nhan binh chon.");
    await loadMatches();
  }

  if (isLoading) {
    return <div className="card p-6 text-sm text-slate-600">Dang tai tran dau...</div>;
  }

  return (
    <section className="space-y-4">
      {feedback && <div className="rounded-xl bg-brand-50 p-3 text-sm text-brand-700">{feedback}</div>}
      <div className="rounded-xl bg-amber-50 p-3 text-xs font-medium text-amber-800">
        Luu y: Neu khong binh chon truoc khi dong tran, he thong mac dinh tinh thua va phai dong tien theo luat.
      </div>

      {sorted.length === 0 && <div className="card p-6 text-slate-600">Khong co tran nao mo binh chon.</div>}

      {sorted.map((match) => (
        <article key={match.id} className="card overflow-hidden">
          <header className="border-b border-slate-100 bg-slate-50 px-4 py-3 sm:px-5">
            <h2 className="text-lg font-semibold text-slate-900">{match.title}</h2>
            <p className="mt-1 text-xs text-slate-500">
              {match.optionALabel} vs {match.optionBLabel} · Khoa luc {format(new Date(match.lockAt), "dd/MM/yyyy HH:mm")} ·
              {" "}Phat sai {formatCurrency(match.penaltyAmount)} · Ket qua: {match.result}
            </p>
          </header>

          <div className="space-y-3 p-4 sm:p-5">
            {match.result !== "PENDING" && (
              <div className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700">Tran nay da chot ket qua: {match.result}</div>
            )}
            {match.result === "PENDING" && new Date(match.lockAt).getTime() <= Date.now() && (
              <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">Tran nay da qua gio khoa binh chon.</div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setChoices((prev) => ({ ...prev, [match.id]: "A" }))}
                className={`rounded-xl border p-4 text-left transition ${
                  choices[match.id] === "A" ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:border-brand-200"
                }`}
              >
                <span className="text-xs uppercase text-slate-500">Lua chon A</span>
                <p className="mt-1 font-semibold text-slate-800">{match.optionALabel}</p>
              </button>
              <button
                type="button"
                onClick={() => setChoices((prev) => ({ ...prev, [match.id]: "B" }))}
                className={`rounded-xl border p-4 text-left transition ${
                  choices[match.id] === "B" ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:border-brand-200"
                }`}
              >
                <span className="text-xs uppercase text-slate-500">Lua chon B</span>
                <p className="mt-1 font-semibold text-slate-800">{match.optionBLabel}</p>
              </button>
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                {match.myVote ? `Da chon ${match.myVote.choice} (${match.myVote.source})` : "Chua binh chon"}
              </p>
              <button
                type="button"
                onClick={() => submitVote(match.id)}
                disabled={match.result !== "PENDING"}
                className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {match.result !== "PENDING" ? "Da dong" : "Gui"}
              </button>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
