import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: userId } = await params;
  const client = await prisma.user.findFirst({
    where: { id: userId, role: Role.client },
  });
  if (!client) return NextResponse.json({ error: "Client not found." }, { status: 404 });
  try {
    const body = await request.json();
    const { fieldValues, summary, rawFileUrl } = body;
    const result = await prisma.dNAResult.create({
      data: {
        userId,
        fieldValues: fieldValues && typeof fieldValues === "object" ? fieldValues : null,
        summary: typeof summary === "string" ? summary : null,
        rawFileUrl: typeof rawFileUrl === "string" ? rawFileUrl : null,
      },
    });
    return NextResponse.json(result);
  } catch (e) {
    console.error("Create DNA result error:", e);
    return NextResponse.json({ error: "Failed to create DNA result." }, { status: 500 });
  }
}
