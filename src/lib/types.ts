export type RoleType = "ADMIN" | "MEMBER";
export type VoteChoiceType = "A" | "B";
export type VoteSourceType = "SELF" | "ADMIN_IMPORT";
export type MatchResultType = "PENDING" | "A" | "B";

export type SessionUser = {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  role: RoleType;
  isActive: boolean;
};

export type ActiveMatchItem = {
  id: string;
  title: string;
  optionALabel: string;
  optionBLabel: string;
  penaltyAmount: number;
  startAt: string;
  lockAt: string;
  result: MatchResultType;
  myVote: {
    id: string;
    choice: VoteChoiceType;
    source: VoteSourceType;
    updatedAt: string;
  } | null;
  voteStats: {
    totalMembers: number;
    countA: number;
    countB: number;
    countUnvoted: number;
    percentA: number;
    percentB: number;
    percentUnvoted: number;
    usersA: string[];
    usersB: string[];
    usersUnvoted: string[];
  };
};

export type SummaryRow = {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  amountDue: number;
  amountPaid: number;
  outstanding: number;
  isTop: boolean;
};

export type SummaryResponse = {
  scope: "all" | "match";
  matchId: string | null;
  totals: {
    totalDue: number;
    totalPaid: number;
    totalOutstanding: number;
  };
  tableRows: SummaryRow[];
  pieData: Array<{
    userId: string;
    name: string;
    value: number;
    isTop: boolean;
  }>;
};
