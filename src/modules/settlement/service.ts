import { db } from "@/lib/db";
import type { ChargeStatus } from "@/lib/domain";

function resolveChargeStatus(amountDue: number, amountPaid: number): ChargeStatus {
  if (amountDue <= 0) return "PAID";
  if (amountPaid <= 0) return "UNPAID";
  if (amountPaid >= amountDue) return "PAID";
  return "PARTIAL";
}

export async function recalculateMatchCharges(matchId: string) {
  const match = await db.match.findUnique({
    where: { id: matchId },
    select: {
      id: true,
      result: true,
      penaltyAmount: true,
      lockAt: true,
      votes: {
        select: {
          userId: true,
          choice: true
        }
      }
    }
  });

  if (!match || match.result === "PENDING") {
    return [];
  }

  const paymentTotals = await db.payment.groupBy({
    by: ["userId"],
    where: { matchId },
    _sum: { amount: true }
  });

  const paidMap = new Map(paymentTotals.map((item) => [item.userId, item._sum.amount ?? 0]));

  const eligibleMembers = await db.user.findMany({
    where: {
      role: "MEMBER",
      createdAt: {
        lte: match.lockAt
      }
    },
    select: {
      id: true
    }
  });

  const voteByUserId = new Map(match.votes.map((vote) => [vote.userId, vote.choice]));

  const operations = eligibleMembers.map((member) => {
    const choice = voteByUserId.get(member.id);
    const amountDue = choice === match.result ? 0 : match.penaltyAmount;
    const amountPaid = paidMap.get(member.id) ?? 0;
    const status = resolveChargeStatus(amountDue, amountPaid);

    return db.charge.upsert({
      where: {
        matchId_userId: {
          matchId,
          userId: member.id
        }
      },
      update: {
        amountDue,
        amountPaid,
        status,
        calculatedAt: new Date()
      },
      create: {
        matchId,
        userId: member.id,
        amountDue,
        amountPaid,
        status,
        calculatedAt: new Date()
      }
    });
  });

  return db.$transaction(operations);
}

export async function recordPayment(input: {
  matchId: string;
  userId: string;
  amount: number;
  recordedById: string;
  paidAt?: Date;
  note?: string;
}) {
  const targetUser = await db.user.findUnique({
    where: { id: input.userId },
    select: { role: true }
  });

  if (!targetUser || targetUser.role !== "MEMBER") {
    throw new Error("USER_NOT_MEMBER");
  }

  const payment = await db.payment.create({
    data: {
      matchId: input.matchId,
      userId: input.userId,
      amount: input.amount,
      recordedById: input.recordedById,
      paidAt: input.paidAt,
      note: input.note
    }
  });

  const charge = await db.charge.findUnique({
    where: {
      matchId_userId: {
        matchId: input.matchId,
        userId: input.userId
      }
    }
  });

  if (charge) {
    const totalPaid = await db.payment.aggregate({
      where: {
        matchId: input.matchId,
        userId: input.userId
      },
      _sum: { amount: true }
    });

    const amountPaid = totalPaid._sum.amount ?? 0;

    await db.charge.update({
      where: {
        matchId_userId: {
          matchId: input.matchId,
          userId: input.userId
        }
      },
      data: {
        amountPaid,
        status: resolveChargeStatus(charge.amountDue, amountPaid)
      }
    });
  }

  return payment;
}
