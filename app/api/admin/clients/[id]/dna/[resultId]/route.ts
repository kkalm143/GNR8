import { NextResponse } from "next/server";
import { requireAdmin, apiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; resultId: string }> }
) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  const { id: userId, resultId } = await params;
  const result = await prisma.dNAResult.findFirst({
    where: { id: resultId, userId },
  });
  if (!result) return apiError("DNA result not found.", 404);
  return NextResponse.json(result);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; resultId: string }> }
) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  const { id: userId, resultId } = await params;
  const existing = await prisma.dNAResult.findFirst({
    where: { id: resultId, userId },
  });
  if (!existing) return apiError("DNA result not found.", 404);
  try {
    const body = await request.json();
    const { fieldValues, summary, rawFileUrl } = body;
    const data: Record<string, unknown> = {};
    if (fieldValues !== undefined) data.fieldValues = fieldValues && typeof fieldValues === "object" ? fieldValues : null;
    if (summary !== undefined) data.summary = typeof summary === "string" ? summary : null;
    if (rawFileUrl !== undefined) data.rawFileUrl = typeof rawFileUrl === "string" ? rawFileUrl : null;
    const result = await prisma.dNAResult.update({
      where: { id: resultId },
      data,
    });
    return NextResponse.json(result);
  } catch (e) {
    console.error("Update DNA result error:", e);
    return apiError("Failed to update DNA result.", 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; resultId: string }> }
) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  const { id: userId, resultId } = await params;
  const existing = await prisma.dNAResult.findFirst({
    where: { id: resultId, userId },
  });
  if (!existing) return apiError("DNA result not found.", 404);
  try {
    await prisma.dNAResult.delete({ where: { id: resultId } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("Delete DNA result error:", e);
    return apiError("Failed to delete DNA result.", 500);
  }
}
