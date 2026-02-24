import { NextResponse } from "next/server";
import { requireAdmin, apiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  const groups = await prisma.clientGroup.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { users: true } } },
  });
  return NextResponse.json(groups);
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  try {
    const body = await request.json();
    const { name, description } = body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return apiError("Name is required.", 400);
    }
    const group = await prisma.clientGroup.create({
      data: {
        name: name.trim(),
        description: typeof description === "string" ? description.trim() || null : null,
      },
    });
    return NextResponse.json(group);
  } catch (e) {
    console.error("Create client group error:", e);
    return apiError("Failed to create group.", 500);
  }
}
