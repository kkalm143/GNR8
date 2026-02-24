import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  const userId = session.user.id;
  const assignments = await prisma.programAssignment.findMany({
    where: { userId },
    include: {
      program: true,
    },
    orderBy: { assignedAt: "desc" },
  });
  return NextResponse.json(assignments);
}
