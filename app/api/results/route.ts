import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  const results = await prisma.dNAResult.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      summary: true,
      createdAt: true,
      rawFileUrl: true,
    },
  });
  return NextResponse.json(results);
}
