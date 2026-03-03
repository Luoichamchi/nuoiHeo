import { db } from "@/lib/db";
import type { VoteChoice, VoteSource } from "@/lib/domain";
import { parseVoteCsv, type ImportedVoteChoice } from "@/lib/csv";
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
  const validRows: { userId: string; choice: ImportedVoteChoice }[] = [];

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
    if (item.choice === "NONE") {
      return db.vote.deleteMany({
        where: {
          matchId: params.matchId,
          userId: item.userId
        }
      });
    }

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
  const members = await db.user.findMany({
    where: {
      isActive: true,
      role: "MEMBER"
    },
    select: {
      id: true,
      fullName: true
    }
  });

  const memberIds = new Set(members.map((member) => member.id));

  const matches = await db.match.findMany({
    orderBy: [{ startAt: "desc" }, { createdAt: "desc" }],
    include: {
      votes: {
        select: {
          id: true,
          userId: true,
          choice: true,
          source: true,
          updatedAt: true
        }
      }
    }
  });

  const toPercent = (count: number, total: number) => {
    if (total <= 0) return 0;
    return Number(((count / total) * 100).toFixed(1));
  };

  return matches.map((match) => {
    const memberVotes = match.votes.filter((vote) => memberIds.has(vote.userId));
    const myVote = memberVotes.find((vote) => vote.userId === userId) ?? null;
    const voteChoiceByUserId = new Map(memberVotes.map((vote) => [vote.userId, vote.choice]));

    const usersA = members.filter((member) => voteChoiceByUserId.get(member.id) === "A").map((member) => member.fullName);
    const usersB = members.filter((member) => voteChoiceByUserId.get(member.id) === "B").map((member) => member.fullName);
    const usersUnvoted = members.filter((member) => !voteChoiceByUserId.has(member.id)).map((member) => member.fullName);

    const totalMembers = members.length;
    const countA = usersA.length;
    const countB = usersB.length;
    const countUnvoted = usersUnvoted.length;

    return {
      id: match.id,
      title: match.title,
      optionALabel: match.optionALabel,
      optionBLabel: match.optionBLabel,
      penaltyAmount: match.penaltyAmount,
      startAt: match.startAt,
      lockAt: match.lockAt,
      result: match.result,
      myVote: myVote
        ? {
            id: myVote.id,
            choice: myVote.choice,
            source: myVote.source,
            updatedAt: myVote.updatedAt
          }
        : null,
      voteStats: {
        totalMembers,
        countA,
        countB,
        countUnvoted,
        percentA: toPercent(countA, totalMembers),
        percentB: toPercent(countB, totalMembers),
        percentUnvoted: toPercent(countUnvoted, totalMembers),
        usersA,
        usersB,
        usersUnvoted
      }
    };
  });
}
