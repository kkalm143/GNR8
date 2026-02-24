import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ProgressEntryType } from "@prisma/client";

const VALID_TYPES: ProgressEntryType[] = [
  "note",
  "workout_completed",
  "body_metric",
  "measurement",
  "progress_photo",
];

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const entries = await prisma.progressEntry.findMany({
    where: { userId: session.user.id },
    include: {
      programAssignment: {
        include: { program: { select: { id: true, name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { content, programAssignmentId, type, value, loggedAt } = body;
    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ error: "Content is required." }, { status: 400 });
    }
    if (programAssignmentId != null) {
      if (typeof programAssignmentId !== "string") {
        return NextResponse.json({ error: "Invalid programAssignmentId." }, { status: 400 });
      }
      const assignment = await prisma.programAssignment.findFirst({
        where: { id: programAssignmentId, userId: session.user.id },
      });
      if (!assignment) {
        return NextResponse.json({ error: "Assignment not found." }, { status: 404 });
      }
    }
    const entryType =
      type && VALID_TYPES.includes(type) ? type : "note";
    const entry = await prisma.progressEntry.create({
      data: {
        userId: session.user.id,
        content: content.trim(),
        type: entryType,
        programAssignmentId:
          typeof programAssignmentId === "string" && programAssignmentId
            ? programAssignmentId
            : null,
        value: typeof value === "number" && !Number.isNaN(value) ? value : null,
        loggedAt: loggedAt ? new Date(loggedAt) : null,
      },
      include: {
        programAssignment: {
          include: { program: { select: { id: true, name: true } } },
        },
      },
    });
    return NextResponse.json(entry);
  } catch (e) {
    console.error("Create progress entry error:", e);
    return NextResponse.json({ error: "Failed to save progress." }, { status: 500 });
  }
}
