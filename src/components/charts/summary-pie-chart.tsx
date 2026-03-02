"use client";

import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/money";

const COLORS = ["#1e60e8", "#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"];

type Item = {
  userId: string;
  name: string;
  value: number;
  isTop: boolean;
};

export function SummaryPieChart({ data }: { data: Item[] }) {
  if (data.length === 0) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">Chua co du lieu chart.</div>;
  }

  return (
    <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[minmax(260px,1fr)_220px]">
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={105}
              innerRadius={46}
              paddingAngle={2}
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.userId}
                  fill={COLORS[index % COLORS.length]}
                  stroke={entry.isTop ? "#111827" : "transparent"}
                  strokeWidth={entry.isTop ? 3 : 0}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-2 text-sm">
        {data.map((entry, index) => (
          <li key={entry.userId} className={`rounded-lg px-3 py-2 ${entry.isTop ? "bg-amber-50 text-amber-800" : "bg-slate-50 text-slate-700"}`}>
            <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
            <span className="font-medium">{entry.name}</span>
            <span className="float-right">{formatCurrency(entry.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
