import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const exercise = await prisma.exercise.findUnique({ where: { id } });
  if (!exercise) return NextResponse.json({ error: "Exercise not found." }, { status: 404 });
  return NextResponse.json(exercise);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const existing = await prisma.exercise.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Exercise not found." }, { status: 404 });
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
    return NextResponse.json({ error: "Failed to update exercise." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    await prisma.exercise.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("Delete exercise error:", e);
    return NextResponse.json({ error: "Exercise not found or could not be deleted." }, { status: 500 });
  }
}
