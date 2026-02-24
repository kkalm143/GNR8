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
  const { id: programId } = await params;
  const program = await prisma.program.findUnique({ where: { id: programId } });
  if (!program) return apiError("Program not found.", 404);
  try {
    const body = await request.json();
    const { userIds, startDate, endDate } = body;
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return apiError("userIds must be a non-empty array.", 400);
    }
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    const assigned: Array<{ id: string; userId: string; programId: string }> = [];
    const errors: Array<{ userId: string; error: string }> = [];
    for (const userId of userIds) {
      if (typeof userId !== "string") continue;
      const client = await prisma.user.findFirst({
        where: { id: userId, role: Role.client },
      });
      if (!client) {
        errors.push({ userId, error: "Client not found." });
        continue;
      }
      const existing = await prisma.programAssignment.findUnique({
        where: { userId_programId: { userId, programId } },
      });
      if (existing) {
        errors.push({ userId, error: "Client is already assigned to this program." });
        continue;
      }
      const assignment = await prisma.programAssignment.create({
        data: {
          userId,
          programId,
          startDate: start && !isNaN(start.getTime()) ? start : null,
          endDate: end && !isNaN(end.getTime()) ? end : null,
        },
        select: { id: true, userId: true, programId: true },
      });
      assigned.push(assignment);
    }
    return NextResponse.json({ assigned, errors: errors.length ? errors : undefined });
  } catch (e) {
    console.error("Assign program to multiple clients error:", e);
    return apiError("Failed to assign program.", 500);
  }
}
