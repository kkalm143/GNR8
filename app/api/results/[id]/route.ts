import { NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  const { id } = await params;
  const result = await prisma.dNAResult.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!result) {
    return apiError("Result not found.", 404);
  }
  const fields = await prisma.dNAInterpretationField.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true, type: true, min: true, max: true, options: true },
  });
  const fieldValues = (result.fieldValues as Record<string, string | number> | null) ?? {};
  const fieldsWithValues = fields.map((f) => ({
    id: f.id,
    name: f.name,
    type: f.type,
    min: f.min,
    max: f.max,
    options: f.options,
    value: fieldValues[f.id] ?? null,
  }));
  return NextResponse.json({
    id: result.id,
    summary: result.summary,
    rawFileUrl: result.rawFileUrl,
    createdAt: result.createdAt,
    fields: fieldsWithValues,
  });
}
