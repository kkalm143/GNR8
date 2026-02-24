import { NextResponse } from "next/server";
import { requireAdmin, apiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  const { id: userId } = await params;
  const client = await prisma.user.findFirst({
    where: { id: userId, role: Role.client },
  });
  if (!client) return apiError("Client not found.", 404);
  try {
    const body = await request.json();
    const { programId, startDate, endDate } = body;
    if (!programId || typeof programId !== "string") {
      return apiError("programId is required.", 400);
    }
    const program = await prisma.program.findUnique({ where: { id: programId } });
    if (!program) return apiError("Program not found.", 404);
    const existing = await prisma.programAssignment.findUnique({
      where: { userId_programId: { userId, programId } },
    });
    if (existing) {
      return apiError("Client is already assigned to this program.", 409);
    }
    const assignment = await prisma.programAssignment.create({
      data: {
        userId,
        programId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
      include: { program: { select: { id: true, name: true } } },
    });
    return NextResponse.json(assignment);
  } catch (e) {
    console.error("Assign program error:", e);
    return apiError("Failed to assign program.", 500);
  }
}
