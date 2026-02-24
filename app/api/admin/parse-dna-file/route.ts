import { NextResponse } from "next/server";
import { requireAdmin, apiError } from "@/lib/api-helpers";
import { parseLabFile, isLabFileFormat } from "@/lib/parseLabFile";

const MAX_FILE_BYTES = 100 * 1024; // 100KB for parse

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;

  let buffer: Buffer;
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return apiError("No file provided. Send a file in the 'file' field.", 400);
    }
    const ab = await file.slice(0, MAX_FILE_BYTES).arrayBuffer();
    buffer = Buffer.from(ab);
  } catch (e) {
    console.error("Parse DNA file: read error", e);
    return apiError("Failed to read file.", 400);
  }

  if (buffer.length === 0) {
    return apiError("File is empty.", 400);
  }

  if (!isLabFileFormat(buffer)) {
    return NextResponse.json({
      error: "File does not look like a lab DNA report. Expected [Header] and [Data] sections (tab-delimited).",
      parsed: null,
    }, { status: 400 });
  }

  const result = parseLabFile(buffer);
  if (!result.ok) {
    return NextResponse.json({ error: result.error, parsed: null }, { status: 400 });
  }

  return NextResponse.json({
    summary: result.summary,
    sampleId: result.sampleId,
    processingDate: result.processingDate,
    gender: result.gender,
    numSnps: result.numSnps,
    header: result.header,
    dataColumns: result.dataColumns,
  });
}
