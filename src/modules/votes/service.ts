import { db } from "@/lib/db";
import type { VoteChoice, VoteSource } from "@/lib/domain";
import { parseVoteCsv } from "@/lib/csv";
import { recalculateMatchCharges } from "@/modules/settlement/service";

export async function upsertVote(params: {
  matchId: string;
  userId: string;
  choice: VoteChoice;
  source?: VoteSource;
  updatedById?: string;
}) {
  const match = await db.match.findUnique({ where: { id: params.matchId } });
  if (!match) {
    throw new Error("MATCH_NOT_FOUND");
  }

  if (match.result !== "PENDING") {
    throw new Error("MATCH_CLOSED");
  }

  if (new Date() > match.lockAt) {
    throw new Error("VOTE_LOCKED");
  }

  const vote = await db.vote.upsert({
    where: {
      matchId_userId: {
        matchId: params.matchId,
        userId: params.userId
      }
    },
    update: {
      choice: params.choice,
      source: params.source ?? "SELF",
      updatedById: params.updatedById ?? null
    },
    create: {
      matchId: params.matchId,
      userId: params.userId,
      choice: params.choice,
      source: params.source ?? "SELF",
      updatedById: params.updatedById ?? null
    }
  });

  return vote;
}

export async function getVotesByUser(userId: string) {
  return db.vote.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      match: {
        select: {
          id: true,
          title: true,
          optionALabel: true,
          optionBLabel: true,
          lockAt: true,
          startAt: true,
          result: true,
          penaltyAmount: true
        }
      }
    }
  });
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

export async function importVotesFromCsv(params: {
  matchId: string;
  csvContent: string;
  fileName: string;
  uploadedById: string;
}) {
  const match = await db.match.findUnique({
    where: { id: params.matchId },
    select: { id: true, result: true }
  });
  if (!match) {
    throw new Error("MATCH_NOT_FOUND");
  }

  const parsed = parseVoteCsv(params.csvContent);

  const users = await db.user.findMany({
    where: { isActive: true, role: "MEMBER" },
    select: { id: true, fullName: true }
  });

  const userById = new Map(users.map((user) => [user.id, user]));
  const userByName = new Map(users.map((user) => [normalizeName(user.fullName), user]));

  const errorRows: string[] = [...parsed.errors];
  const validRows: { userId: string; choice: VoteChoice }[] = [];

  parsed.rows.forEach((row) => {
    let targetUser = row.userId ? userById.get(row.userId) : undefined;
    if (!targetUser && row.fullName) {
      targetUser = userByName.get(normalizeName(row.fullName));
    }

    if (!targetUser) {
      errorRows.push(`Row ${row.rowNumber}: user not found`);
      return;
    }

    validRows.push({ userId: targetUser.id, choice: row.choice });
  });

  const batch = await db.importBatch.create({
    data: {
      matchId: params.matchId,
      fileName: params.fileName,
      uploadedById: params.uploadedById,
      totalRows: parsed.rows.length,
      successRows: validRows.length,
      failedRows: errorRows.length,
      errorRows: JSON.stringify(errorRows)
    }
  });

  const operations = validRows.map((item) => {
    return db.vote.upsert({
      where: {
        matchId_userId: {
          matchId: params.matchId,
          userId: item.userId
        }
      },
      update: {
        choice: item.choice,
        source: "ADMIN_IMPORT",
        importedBatchId: batch.id,
        updatedById: params.uploadedById
      },
      create: {
        matchId: params.matchId,
        userId: item.userId,
        choice: item.choice,
        source: "ADMIN_IMPORT",
        importedBatchId: batch.id,
        updatedById: params.uploadedById
      }
    });
  });

  if (operations.length > 0) {
    await db.$transaction(operations);
  }

  if (match.result !== "PENDING") {
    await recalculateMatchCharges(params.matchId);
  }

  return {
    batchId: batch.id,
    totalRows: parsed.rows.length,
    successRows: validRows.length,
    failedRows: errorRows.length,
    errors: errorRows
  };
}

export async function getVotesForActiveMatches(userId: string) {
  const matches = await db.match.findMany({
    orderBy: [{ startAt: "desc" }, { createdAt: "desc" }],
    include: {
      votes: {
        where: { userId },
        select: {
          id: true,
          choice: true,
          source: true,
          updatedAt: true
        }
      }
    }
  });

  return matches.map((match) => {
    const vote = match.votes[0] ?? null;
    return {
      ...match,
      myVote: vote
    };
  });
}
