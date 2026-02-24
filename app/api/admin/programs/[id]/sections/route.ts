import { NextResponse } from "next/server";
import { requireAdmin, apiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  const { id: programId } = await params;
  const program = await prisma.program.findUnique({
    where: { id: programId },
    include: {
      workoutSections: {
        orderBy: { displayOrder: "asc" },
        include: {
          sets: {
            orderBy: { displayOrder: "asc" },
            include: { exercise: { select: { id: true, name: true } } },
          },
        },
      },
    },
  });
  if (!program) return apiError("Program not found.", 404);
  return NextResponse.json(program.workoutSections);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  const { id: programId } = await params;
  const program = await prisma.program.findUnique({ where: { id: programId } });
  if (!program) return apiError("Program not found.", 404);
  try {
    const body = await request.json();
    const { type, name, displayOrder, durationSeconds, metadata } = body;
    const maxOrder = await prisma.workoutSection.findFirst({
      where: { programId },
      orderBy: { displayOrder: "desc" },
      select: { displayOrder: true },
    });
    const section = await prisma.workoutSection.create({
      data: {
        programId,
        type: typeof type === "string" ? type : "freestyle",
        name: typeof name === "string" ? name.trim() || null : null,
        displayOrder: typeof displayOrder === "number" ? displayOrder : (maxOrder?.displayOrder ?? -1) + 1,
        durationSeconds: typeof durationSeconds === "number" ? durationSeconds : null,
        metadata: metadata && typeof metadata === "object" ? metadata : null,
      },
    });
    return NextResponse.json(section);
  } catch (e) {
    console.error("Create section error:", e);
    return apiError("Failed to create section.", 500);
  }
}
