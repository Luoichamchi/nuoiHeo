import { z } from "zod";
import { MATCH_RESULTS, ROLES, VOTE_CHOICES } from "@/lib/domain";

export const loginSchema = z.object({
  userId: z.string().min(1),
  pin: z.string().min(4).max(20)
});

export const createUserSchema = z.object({
  userId: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(40)
    .regex(/^[a-z0-9._-]+$/, "userId chi duoc gom chu thuong, so, ., _, -"),
  fullName: z.string().min(2).max(120),
  pin: z.string().min(4).max(20),
  role: z.enum(ROLES).default("MEMBER"),
  isActive: z.boolean().default(true)
});

export const updateUserSchema = z.object({
  fullName: z.string().min(2).max(120).optional(),
  pin: z.string().min(4).max(20).optional(),
  role: z.enum(ROLES).optional(),
  isActive: z.boolean().optional()
});

export const createMatchSchema = z.object({
  title: z.string().min(3).max(200),
  optionALabel: z.string().min(1).max(80),
  optionBLabel: z.string().min(1).max(80),
  penaltyAmount: z.coerce.number().int().min(0),
  startAt: z.string().datetime(),
  lockAt: z.string().datetime()
});

export const updateMatchSchema = createMatchSchema.partial();

export const setResultSchema = z.object({
  result: z.enum(MATCH_RESULTS).refine((value) => value !== "PENDING", {
    message: "Result must be A or B"
  })
});

export const voteSchema = z.object({
  choice: z.enum(VOTE_CHOICES)
});

export const paymentSchema = z.object({
  matchId: z.string().min(1),
  userId: z.string().min(1),
  amount: z.coerce.number().int().min(1),
  paidAt: z.string().datetime().optional(),
  note: z.string().max(300).optional()
});
