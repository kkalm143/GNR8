import { NextResponse } from "next/server";
import { requireAdmin, apiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  const { sectionId } = await params;
  const section = await prisma.workoutSection.findUnique({
    where: { id: sectionId },
    include: { sets: { orderBy: { displayOrder: "desc" }, take: 1 } },
  });
  if (!section) return apiError("Section not found.", 404);
  try {
    const body = await request.json();
    const { exerciseId, reps, repRange, weight, durationSeconds, notes, setType, customLabel, displayOrder } = body;
    const maxOrder = section.sets[0]?.displayOrder ?? -1;
    const set = await prisma.workoutSet.create({
      data: {
        sectionId,
        exerciseId: typeof exerciseId === "string" ? exerciseId : null,
        displayOrder: typeof displayOrder === "number" ? displayOrder : maxOrder + 1,
        reps: typeof reps === "string" ? reps : null,
        repRange: typeof repRange === "string" ? repRange : null,
        weight: typeof weight === "string" ? weight : null,
        durationSeconds: typeof durationSeconds === "number" ? durationSeconds : null,
        notes: typeof notes === "string" ? notes : null,
        setType: typeof setType === "string" ? setType : "normal",
        customLabel: typeof customLabel === "string" ? customLabel : null,
      },
      include: { exercise: { select: { id: true, name: true } } },
    });
    return NextResponse.json(set);
  } catch (e) {
    console.error("Create set error:", e);
    return apiError("Failed to create set.", 500);
  }
}
