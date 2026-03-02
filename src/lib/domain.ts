export const ROLES = ["ADMIN", "MEMBER"] as const;
export type Role = (typeof ROLES)[number];

export const VOTE_CHOICES = ["A", "B"] as const;
export type VoteChoice = (typeof VOTE_CHOICES)[number];

export const MATCH_RESULTS = ["PENDING", "A", "B"] as const;
export type MatchResult = (typeof MATCH_RESULTS)[number];

export const VOTE_SOURCES = ["SELF", "ADMIN_IMPORT"] as const;
export type VoteSource = (typeof VOTE_SOURCES)[number];

export const CHARGE_STATUSES = ["UNPAID", "PARTIAL", "PAID"] as const;
export type ChargeStatus = (typeof CHARGE_STATUSES)[number];
