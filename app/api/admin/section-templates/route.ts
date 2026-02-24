import { NextResponse } from "next/server";
import { requireAdmin, apiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  const templates = await prisma.sectionTemplate.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(templates);
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  try {
    const body = await request.json();
    const { name, type, defaultDuration, defaultReps, metadata, sectionId } = body;
    if (sectionId && typeof sectionId === "string") {
      const section = await prisma.workoutSection.findUnique({
        where: { id: sectionId },
        include: { sets: true },
      });
      if (!section) return apiError("Section not found.", 404);
      const template = await prisma.sectionTemplate.create({
        data: {
          name: typeof name === "string" && name.trim() ? name.trim() : section.name ?? `${section.type} section`,
          type: section.type,
          defaultDuration: section.durationSeconds,
          defaultReps: null,
          metadata: section.sets.length
            ? { setCount: section.sets.length }
            : (metadata && typeof metadata === "object" ? metadata : null),
        },
      });
      return NextResponse.json(template);
    }
    const template = await prisma.sectionTemplate.create({
      data: {
        name: typeof name === "string" && name.trim() ? name.trim() : "Untitled template",
        type: typeof type === "string" ? type : "freestyle",
        defaultDuration:
          typeof defaultDuration === "number" ? defaultDuration : typeof defaultDuration === "string" ? parseInt(defaultDuration, 10) || null : null,
        defaultReps: typeof defaultReps === "string" ? defaultReps.trim() || null : null,
        metadata: metadata && typeof metadata === "object" ? metadata : null,
      },
    });
    return NextResponse.json(template);
  } catch (e) {
    console.error("Create section template error:", e);
    return apiError("Failed to create template.", 500);
  }
}
