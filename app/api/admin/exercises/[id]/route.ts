import { NextResponse } from "next/server";
import { requireAdmin, apiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  const { id } = await params;
  const exercise = await prisma.exercise.findUnique({ where: { id } });
  if (!exercise) return apiError("Exercise not found.", 404);
  return NextResponse.json(exercise);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  const { id } = await params;
  const existing = await prisma.exercise.findUnique({ where: { id } });
  if (!existing) return apiError("Exercise not found.", 404);
  try {
    const body = await request.json();
    const { name, description, demoVideoUrl } = body;
    const data: { name?: string; description?: string | null; demoVideoUrl?: string | null } = {};
    if (typeof name === "string" && name.trim()) data.name = name.trim();
    if (description !== undefined) data.description = typeof description === "string" ? description.trim() || null : null;
    if (demoVideoUrl !== undefined) data.demoVideoUrl = typeof demoVideoUrl === "string" ? demoVideoUrl.trim() || null : null;
    const exercise = await prisma.exercise.update({
      where: { id },
      data,
    });
    return NextResponse.json(exercise);
  } catch (e) {
    console.error("Update exercise error:", e);
    return apiError("Failed to update exercise.", 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  const { id } = await params;
  try {
    await prisma.exercise.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("Delete exercise error:", e);
    return apiError("Exercise not found or could not be deleted.", 500);
  }
}
