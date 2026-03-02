import { parse } from "csv-parse/sync";
import type { VoteChoice } from "@/lib/domain";

export type ParsedVoteRow = {
  userId?: string;
  fullName?: string;
  choice: VoteChoice;
  rowNumber: number;
};

const CHOICE_MAP: Record<string, VoteChoice> = {
  A: "A",
  B: "B"
};

function normalizeChoice(value: string): VoteChoice | null {
  const upper = value.trim().toUpperCase();
  return CHOICE_MAP[upper] ?? null;
}

export function parseVoteCsv(content: string): { rows: ParsedVoteRow[]; errors: string[] } {
  let records: Record<string, string>[] = [];
  try {
    records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }) as Record<string, string>[];
  } catch {
    return {
      rows: [],
      errors: ["Invalid CSV format"]
    };
  }

  const rows: ParsedVoteRow[] = [];
  const errors: string[] = [];

  records.forEach((record, index) => {
    const rowNumber = index + 2;
    const userId = record.userId?.trim();
    const fullName = record.fullName?.trim();
    const choice = normalizeChoice(record.choice || "");

    if (!choice) {
      errors.push(`Row ${rowNumber}: choice must be A or B`);
      return;
    }

    if (!userId && !fullName) {
      errors.push(`Row ${rowNumber}: userId or fullName is required`);
      return;
    }

    rows.push({
      userId: userId || undefined,
      fullName: fullName || undefined,
      choice,
      rowNumber
    });
  });

  return { rows, errors };
}
