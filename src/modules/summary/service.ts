import { db } from "@/lib/db";

export type SummaryScope = "all" | "match";

type SummaryParams = {
  scope: SummaryScope;
  matchId?: string;
  metric?: "due" | "outstanding";
};

export async function buildSummary(params: SummaryParams) {
  const users = await db.user.findMany({
    where: { isActive: true, role: "MEMBER" },
    select: {
      id: true,
      fullName: true,
      avatarUrl: true
    }
  });

  const charges = await db.charge.findMany({
    where:
      params.scope === "match" && params.matchId
        ? {
            matchId: params.matchId
          }
        : undefined,
    select: {
      userId: true,
      amountDue: true,
      amountPaid: true
    }
  });

  const chargeMap = new Map<string, { amountDue: number; amountPaid: number }>();

  charges.forEach((charge) => {
    const existing = chargeMap.get(charge.userId) ?? { amountDue: 0, amountPaid: 0 };
    existing.amountDue += charge.amountDue;
    existing.amountPaid += charge.amountPaid;
    chargeMap.set(charge.userId, existing);
  });

  const tableRows = users
    .map((user) => {
      const totals = chargeMap.get(user.id) ?? { amountDue: 0, amountPaid: 0 };
      const outstanding = Math.max(0, totals.amountDue - totals.amountPaid);
      return {
        userId: user.id,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        amountDue: totals.amountDue,
        amountPaid: totals.amountPaid,
        outstanding,
        isTop: false
      };
    })
    .sort((a, b) => b.amountDue - a.amountDue || b.outstanding - a.outstanding || a.fullName.localeCompare(b.fullName));

  const positiveRows = tableRows.filter((item) => item.amountDue > 0);
  const threshold = positiveRows.length > 0 ? positiveRows[Math.min(2, positiveRows.length - 1)].amountDue : null;

  tableRows.forEach((row) => {
    row.isTop = threshold !== null && row.amountDue >= threshold && row.amountDue > 0;
  });

  const metric = params.metric ?? "due";
  const pieData = tableRows
    .map((row) => {
      const value = metric === "due" ? row.amountDue : row.outstanding;
      return {
        userId: row.userId,
        name: row.fullName,
        value,
        isTop: row.isTop
      };
    })
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value);

  const totalDue = tableRows.reduce((sum, row) => sum + row.amountDue, 0);
  const totalPaid = tableRows.reduce((sum, row) => sum + row.amountPaid, 0);
  const totalOutstanding = Math.max(0, totalDue - totalPaid);

  return {
    scope: params.scope,
    matchId: params.matchId ?? null,
    totals: {
      totalDue,
      totalPaid,
      totalOutstanding
    },
    tableRows,
    pieData
  };
}

export async function buildAdminSummary(matchId?: string) {
  return buildSummary({
    scope: matchId ? "match" : "all",
    matchId,
    metric: "outstanding"
  });
}
