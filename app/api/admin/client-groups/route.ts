import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const groups = await prisma.clientGroup.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { users: true } } },
  });
  return NextResponse.json(groups);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { name, description } = body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
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
    return NextResponse.json({ error: "Failed to create group." }, { status: 500 });
  }
}
