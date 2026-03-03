import { db } from "@/lib/db";
import type { MatchResult } from "@/lib/domain";

type MatchInput = {
  title?: string;
  optionALabel?: string;
  optionBLabel?: string;
  penaltyAmount?: number;
  startAt?: string;
  lockAt?: string;
};

function mapDateInput(value?: string): Date | undefined {
  if (!value) return undefined;
  return new Date(value);
}

export async function listActiveMatches() {
  return db.match.findMany({
    orderBy: [{ startAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      optionALabel: true,
      optionBLabel: true,
      penaltyAmount: true,
      startAt: true,
      lockAt: true,
      result: true,
      createdAt: true
    }
  });
}

export async function listMatches() {
  return db.match.findMany({
    orderBy: { startAt: "desc" },
    select: {
      id: true,
      title: true,
      optionALabel: true,
      optionBLabel: true,
      penaltyAmount: true,
      startAt: true,
      lockAt: true,
      result: true,
      createdAt: true,
      updatedAt: true,
      createdBy: {
        select: {
          id: true,
          fullName: true
        }
      }
    }
  });
}

export async function createMatch(input: Required<MatchInput>, createdById: string) {
  return db.match.create({
    data: {
      title: input.title,
      optionALabel: input.optionALabel,
      optionBLabel: input.optionBLabel,
      penaltyAmount: input.penaltyAmount,
      startAt: new Date(input.startAt),
      lockAt: new Date(input.lockAt),
      createdById
    }
  });
}

export async function updateMatch(matchId: string, input: MatchInput) {
  return db.match.update({
    where: { id: matchId },
    data: {
      title: input.title,
      optionALabel: input.optionALabel,
      optionBLabel: input.optionBLabel,
      penaltyAmount: input.penaltyAmount,
      startAt: mapDateInput(input.startAt),
      lockAt: mapDateInput(input.lockAt)
    }
  });
}

export async function setMatchResult(matchId: string, result: Exclude<MatchResult, "PENDING">) {
  return db.match.update({
    where: { id: matchId },
    data: { result }
  });
}

export async function getMatchById(matchId: string) {
  return db.match.findUnique({ where: { id: matchId } });
}

export async function deleteMatch(matchId: string) {
  const summary = await db.match.findUnique({
    where: { id: matchId },
    select: {
      id: true,
      title: true,
      _count: {
        select: {
          votes: true,
          charges: true,
          payments: true,
          importBatches: true
        }
      }
    }
  });

  if (!summary) return null;

  await db.match.delete({
    where: { id: matchId }
  });

  return summary;
}
