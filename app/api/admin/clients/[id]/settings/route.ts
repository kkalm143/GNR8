import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: userId } = await params;
  const client = await prisma.user.findFirst({
    where: { id: userId, role: Role.client },
    include: { clientProfile: true },
  });
  if (!client?.clientProfile) return NextResponse.json({ error: "Client not found." }, { status: 404 });
  const settings = await prisma.clientSettings.findFirst({
    where: { clientProfileId: client.clientProfile.id },
  });
  const defaults = {
    workoutComments: true,
    workoutVisibility: true,
    allowRearrange: false,
    replaceExercise: false,
    allowCreateWorkouts: false,
    pinnedMetrics: null as string[] | null,
  };
  if (!settings) {
    const created = await prisma.clientSettings.create({
      data: {
        clientProfileId: client.clientProfile.id,
        ...defaults,
      },
    });
    return NextResponse.json(created);
  }
  return NextResponse.json(settings);
}

export async function PATCH(
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
    include: { clientProfile: true },
  });
  if (!client?.clientProfile) return NextResponse.json({ error: "Client not found." }, { status: 404 });
  try {
    const body = await request.json();
    const {
      workoutComments,
      workoutVisibility,
      allowRearrange,
      replaceExercise,
      allowCreateWorkouts,
      pinnedMetrics,
    } = body;
    const data: {
      workoutComments?: boolean;
      workoutVisibility?: boolean;
      allowRearrange?: boolean;
      replaceExercise?: boolean;
      allowCreateWorkouts?: boolean;
      pinnedMetrics?: string[] | null;
    } = {};
    if (typeof workoutComments === "boolean") data.workoutComments = workoutComments;
    if (typeof workoutVisibility === "boolean") data.workoutVisibility = workoutVisibility;
    if (typeof allowRearrange === "boolean") data.allowRearrange = allowRearrange;
    if (typeof replaceExercise === "boolean") data.replaceExercise = replaceExercise;
    if (typeof allowCreateWorkouts === "boolean") data.allowCreateWorkouts = allowCreateWorkouts;
    if (pinnedMetrics !== undefined) data.pinnedMetrics = Array.isArray(pinnedMetrics) ? pinnedMetrics : null;
    const settings = await prisma.clientSettings.upsert({
      where: { clientProfileId: client.clientProfile.id },
      create: {
        clientProfileId: client.clientProfile.id,
        workoutComments: true,
        workoutVisibility: true,
        allowRearrange: false,
        replaceExercise: false,
        allowCreateWorkouts: false,
        ...data,
      },
      update: data,
    });
    return NextResponse.json(settings);
  } catch (e) {
    console.error("Update client settings error:", e);
    return NextResponse.json({ error: "Failed to update settings." }, { status: 500 });
  }
}
