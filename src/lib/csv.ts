import { parse } from "csv-parse/sync";
import type { VoteChoice } from "@/lib/domain";

export type ImportedVoteChoice = VoteChoice | "NONE";

export type ParsedVoteRow = {
  userId?: string;
  fullName?: string;
  choice: ImportedVoteChoice;
  rowNumber: number;
};

const CHOICE_MAP: Record<string, ImportedVoteChoice> = {
  A: "A",
  B: "B",
  NONE: "NONE"
};

function normalizeChoice(value: string): ImportedVoteChoice | null {
  const upper = value.trim().toUpperCase();
  return CHOICE_MAP[upper] ?? null;
}

function detectDelimiter(content: string): "," | ";" {
  const firstLine = content.split(/\r?\n/, 1)[0] || "";
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  return semicolonCount > commaCount ? ";" : ",";
}

export function parseVoteCsv(content: string): { rows: ParsedVoteRow[]; errors: string[] } {
  let records: Record<string, string>[] = [];
  try {
    const delimiter = detectDelimiter(content);
    records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      delimiter
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
      errors.push(`Row ${rowNumber}: choice must be A, B or NONE`);
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
