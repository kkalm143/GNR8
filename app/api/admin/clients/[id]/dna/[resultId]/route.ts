import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; resultId: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: userId, resultId } = await params;
  const result = await prisma.dNAResult.findFirst({
    where: { id: resultId, userId },
  });
  if (!result) return NextResponse.json({ error: "DNA result not found." }, { status: 404 });
  return NextResponse.json(result);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; resultId: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: userId, resultId } = await params;
  const existing = await prisma.dNAResult.findFirst({
    where: { id: resultId, userId },
  });
  if (!existing) return NextResponse.json({ error: "DNA result not found." }, { status: 404 });
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
    return NextResponse.json({ error: "Failed to update DNA result." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; resultId: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: userId, resultId } = await params;
  const existing = await prisma.dNAResult.findFirst({
    where: { id: resultId, userId },
  });
  if (!existing) return NextResponse.json({ error: "DNA result not found." }, { status: 404 });
  try {
    await prisma.dNAResult.delete({ where: { id: resultId } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("Delete DNA result error:", e);
    return NextResponse.json({ error: "Failed to delete DNA result." }, { status: 500 });
  }
}
