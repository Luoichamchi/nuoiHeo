"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SummaryPieChart } from "@/components/charts/summary-pie-chart";
import { AvatarUploadForm } from "@/components/forms/avatar-upload-form";
import { SummaryTable } from "@/components/tables/summary-table";
import { formatCurrency } from "@/lib/money";
import type { SessionUser, SummaryResponse } from "@/lib/types";

type ViewMode = "table" | "chart";
type MetricMode = "due" | "outstanding";

export function SummaryPanel() {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [me, setMe] = useState<SessionUser | null>(null);
  const [mode, setMode] = useState<ViewMode>("table");
  const [metric, setMetric] = useState<MetricMode>("due");

  const loadData = useCallback(async () => {
    const [summaryResponse, meResponse] = await Promise.all([
      fetch(`/api/summary?scope=all&metric=${metric}`, { cache: "no-store" }),
      fetch("/api/auth/me", { cache: "no-store" })
    ]);

    if (summaryResponse.ok) {
      setSummary(await summaryResponse.json());
    }

    if (meResponse.ok) {
      const data = await meResponse.json();
      setMe(data.user as SessionUser);
    }
  }, [metric]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totals = useMemo(() => {
    return (
      summary?.totals || {
        totalDue: 0,
        totalPaid: 0,
        totalOutstanding: 0
      }
    );
  }, [summary]);

  return (
    <section className="space-y-4">
      <div className="card grid gap-3 p-4 sm:grid-cols-[1.2fr_1fr] sm:p-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tong hop dong tien</h1>
          <p className="mt-1 text-sm text-slate-600">Bang + pie chart, highlight top nhom dong nhieu nhat.</p>
        </div>

        {me && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Avatar cua ban</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-200">
                {me.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={me.avatarUrl} alt={me.fullName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-500">
                    {me.fullName.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <AvatarUploadForm userId={me.id} onUploaded={loadData} />
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-xs text-slate-500">Tong phai nop</p>
          <p className="mt-2 text-xl font-bold text-slate-900">{formatCurrency(totals.totalDue)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500">Tong da nop</p>
          <p className="mt-2 text-xl font-bold text-green-700">{formatCurrency(totals.totalPaid)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500">Tong con no</p>
          <p className="mt-2 text-xl font-bold text-amber-700">{formatCurrency(totals.totalOutstanding)}</p>
        </div>
      </div>

      <div className="card p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setMode("table")}
            className={`rounded-full px-3 py-1.5 text-sm ${mode === "table" ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700"}`}
          >
            Bang
          </button>
          <button
            type="button"
            onClick={() => setMode("chart")}
            className={`rounded-full px-3 py-1.5 text-sm ${mode === "chart" ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700"}`}
          >
            Bieu do
          </button>

          <div className="ml-auto flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-slate-500">Metric:</span>
            <button
              type="button"
              onClick={() => setMetric("due")}
              className={`rounded-full px-3 py-1 ${metric === "due" ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-700"}`}
            >
              Phai nop
            </button>
            <button
              type="button"
              onClick={() => setMetric("outstanding")}
              className={`rounded-full px-3 py-1 ${metric === "outstanding" ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-700"}`}
            >
              Con no
            </button>
          </div>
        </div>

        <div className="mt-4">
          {!summary && <p className="text-sm text-slate-500">Dang tai du lieu...</p>}
          {summary && mode === "table" && <SummaryTable rows={summary.tableRows} />}
          {summary && mode === "chart" && <SummaryPieChart data={summary.pieData} />}
        </div>
      </div>
    </section>
  );
}
