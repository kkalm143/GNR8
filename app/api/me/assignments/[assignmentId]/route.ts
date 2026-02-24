import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AssignmentStatus } from "@prisma/client";

const VALID_STATUSES: AssignmentStatus[] = ["assigned", "in_progress", "completed"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { assignmentId } = await params;
  const assignment = await prisma.programAssignment.findFirst({
    where: { id: assignmentId, userId: session.user.id },
  });
  if (!assignment) {
    return NextResponse.json({ error: "Assignment not found." }, { status: 404 });
  }
  try {
    const body = await request.json();
    const { status } = body;
    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Valid status required: assigned, in_progress, or completed." },
        { status: 400 }
      );
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
    return NextResponse.json({ error: "Failed to update status." }, { status: 500 });
  }
}
