import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const role = (session.user as { role?: string }).role;
  if (role === "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  let body: { completed?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body.completed !== "boolean") {
    return NextResponse.json(
      { error: "completed (boolean) is required" },
      { status: 400 }
    );
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
    return NextResponse.json(
      { error: "Client profile not found" },
      { status: 404 }
    );
  }
  return NextResponse.json({
    completed: body.completed,
    onboardingCompletedAt: body.completed ? new Date().toISOString() : null,
  });
}
