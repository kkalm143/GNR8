import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
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
