import { NextResponse } from "next/server";
import { requireAuth, apiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import { AssignmentStatus } from "@prisma/client";

const VALID_STATUSES: AssignmentStatus[] = ["assigned", "in_progress", "completed"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  const { assignmentId } = await params;
  const assignment = await prisma.programAssignment.findFirst({
    where: { id: assignmentId, userId: session.user.id },
  });
  if (!assignment) {
    return apiError("Assignment not found.", 404);
  }
  try {
    const body = await request.json();
    const { status } = body;
    if (!status || !VALID_STATUSES.includes(status)) {
      return apiError("Valid status required: assigned, in_progress, or completed.", 400);
    }
    const data: { status: AssignmentStatus; completedAt?: Date | null } = {
      status,
    };
    if (status === "completed") {
      data.completedAt = new Date();
    } else {
      data.completedAt = null;
    }
    const updated = await prisma.programAssignment.update({
      where: { id: assignmentId },
      data,
      include: { program: { select: { id: true, name: true } } },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("Update assignment status error:", e);
    return apiError("Failed to update status.", 500);
  }
}
