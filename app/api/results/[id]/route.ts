import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const result = await prisma.dNAResult.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!result) {
    return NextResponse.json({ error: "Result not found." }, { status: 404 });
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
