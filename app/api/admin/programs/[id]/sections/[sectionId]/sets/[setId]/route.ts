import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; sectionId: string; setId: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { sectionId, setId } = await params;
  const set = await prisma.workoutSet.findFirst({
    where: { id: setId, sectionId },
  });
  if (!set) return NextResponse.json({ error: "Set not found." }, { status: 404 });
  try {
    const body = await request.json();
    const data: Record<string, unknown> = {};
    ["exerciseId", "reps", "repRange", "weight", "durationSeconds", "notes", "setType", "customLabel", "displayOrder"].forEach((key) => {
      const v = body[key];
      if (v === undefined) return;
      if (key === "displayOrder" && typeof v === "number") data.displayOrder = v;
      if (key === "durationSeconds") data.durationSeconds = typeof v === "number" ? v : null;
      if (["reps", "repRange", "weight", "notes", "setType", "customLabel"].includes(key) && typeof v === "string") (data as Record<string, string | null>)[key] = v || null;
      if (key === "exerciseId") data.exerciseId = typeof v === "string" ? v : null;
    });
    const updated = await prisma.workoutSet.update({
      where: { id: setId },
      data,
      include: { exercise: { select: { id: true, name: true } } },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("Update set error:", e);
    return NextResponse.json({ error: "Failed to update set." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; sectionId: string; setId: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { setId } = await params;
  try {
    await prisma.workoutSet.delete({ where: { id: setId } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("Delete set error:", e);
    return NextResponse.json({ error: "Set not found or could not be deleted." }, { status: 500 });
  }
}
