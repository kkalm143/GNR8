import { NextResponse } from "next/server";
import { requireAdmin, apiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  const exercises = await prisma.exercise.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(exercises);
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  try {
    const body = await request.json();
    const { name, description, demoVideoUrl } = body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return apiError("Name is required.", 400);
    }
    const exercise = await prisma.exercise.create({
      data: {
        name: name.trim(),
        description: typeof description === "string" ? description.trim() || null : null,
        demoVideoUrl: typeof demoVideoUrl === "string" ? demoVideoUrl.trim() || null : null,
      },
    });
    return NextResponse.json(exercise);
  } catch (e) {
    console.error("Create exercise error:", e);
    return apiError("Failed to create exercise.", 500);
  }
}
