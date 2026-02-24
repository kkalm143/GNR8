import { NextResponse } from "next/server";
import { requireClient, apiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";

export async function PATCH(request: Request) {
  const session = await requireClient();
  if (session instanceof NextResponse) return session;
  let body: { completed?: boolean };
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON", 400);
  }
  if (typeof body.completed !== "boolean") {
    return apiError("completed (boolean) is required", 400);
  }
  const profile = await prisma.clientProfile.findFirst({
    where: { userId: session.user.id },
  });
  if (profile) {
    await prisma.clientProfile.update({
      where: { userId: session.user.id },
      data: {
        onboardingCompletedAt: body.completed ? new Date() : null,
      },
    });
  } else if (body.completed) {
    await prisma.clientProfile.create({
      data: {
        userId: session.user.id,
        onboardingCompletedAt: new Date(),
      },
    });
  } else {
    return apiError("Client profile not found", 404);
  }
  return NextResponse.json({
    completed: body.completed,
    onboardingCompletedAt: body.completed ? new Date().toISOString() : null,
  });
}
