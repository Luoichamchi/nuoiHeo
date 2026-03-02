import { NextRequest, NextResponse } from "next/server";
import { badRequest } from "@/lib/http";
import { requireApiSession } from "@/modules/auth/guards";
import { importVotesFromCsv } from "@/modules/votes/service";

export async function POST(request: NextRequest, context: { params: { id: string } }) {
  const guard = requireApiSession(["ADMIN"]);
  if (!guard.ok) return guard.response;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return badRequest("CSV file is required");
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      return badRequest("Only .csv files are supported");
    }

    const csvContent = await file.text();

    const result = await importVotesFromCsv({
      matchId: context.params.id,
      csvContent,
      fileName: file.name,
      uploadedById: guard.session.userId
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "MATCH_NOT_FOUND") {
      return badRequest("Match not found");
    }
    return badRequest("Import failed");
  }
}
