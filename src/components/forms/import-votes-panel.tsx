"use client";

import { FormEvent, useState } from "react";

type Props = {
  matchId: string;
};

export function ImportVotesPanel({ matchId }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{
    totalRows: number;
    successRows: number;
    failedRows: number;
    errors: string[];
  } | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`/api/admin/matches/${matchId}/import-votes`, {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Import that bai");
      return;
    }

    setResult(data);
    setMessage("Import thanh cong");
  }

  return (
    <section className="space-y-4">
      <div className="card p-5">
        <h1 className="text-xl font-bold text-slate-900">Import votes tu CSV</h1>
        <p className="mt-2 text-sm text-slate-600">
          Yeu cau cot: `userId` hoac `fullName`, va `choice` (A/B/NONE). `NONE` = xoa lua chon, coi nhu chua binh chon.
          Ho tro file CSV phan tach bang dau `,` hoac `;`.
        </p>

        <form onSubmit={onSubmit} className="mt-4 flex flex-wrap items-center gap-3">
          <input type="file" accept=".csv,text/csv" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          <button disabled={!file} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            Import
          </button>
        </form>

        {message && <p className="mt-3 text-sm text-brand-700">{message}</p>}
      </div>

      {result && (
        <div className="card p-5">
          <h2 className="text-lg font-bold text-slate-900">Ket qua import</h2>
          <p className="mt-2 text-sm text-slate-600">
            Tong dong: {result.totalRows} · Thanh cong: {result.successRows} · Loi: {result.failedRows}
          </p>

          {result.errors.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-red-600">
              {result.errors.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
