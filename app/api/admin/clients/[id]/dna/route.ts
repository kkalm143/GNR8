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
  const { id: userId } = await params;
  const client = await prisma.user.findFirst({
    where: { id: userId, role: Role.client },
  });
  if (!client) return apiError("Client not found.", 404);
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
    return apiError("Failed to create DNA result.", 500);
  }
}
