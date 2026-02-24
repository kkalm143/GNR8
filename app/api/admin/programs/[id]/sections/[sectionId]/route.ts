import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { sectionId } = await params;
  const section = await prisma.workoutSection.findUnique({ where: { id: sectionId } });
  if (!section) return NextResponse.json({ error: "Section not found." }, { status: 404 });
  try {
    const body = await request.json();
    const { type, name, displayOrder, durationSeconds, metadata } = body;
    const data: Record<string, unknown> = {};
    if (typeof type === "string") data.type = type;
    if (name !== undefined) data.name = typeof name === "string" ? name.trim() || null : null;
    if (typeof displayOrder === "number") data.displayOrder = displayOrder;
    if (durationSeconds !== undefined) data.durationSeconds = typeof durationSeconds === "number" ? durationSeconds : null;
    if (metadata !== undefined) data.metadata = metadata && typeof metadata === "object" ? metadata : null;
    const updated = await prisma.workoutSection.update({
      where: { id: sectionId },
      data,
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("Update section error:", e);
    return NextResponse.json({ error: "Failed to update section." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { sectionId } = await params;
  try {
    await prisma.workoutSection.delete({ where: { id: sectionId } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("Delete section error:", e);
    return NextResponse.json({ error: "Section not found or could not be deleted." }, { status: 500 });
  }
}
