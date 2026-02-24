import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hash } from "bcrypt";
import { Role } from "@prisma/client";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const archived = searchParams.get("archived");
  const search = searchParams.get("search")?.trim();
  const groupId = searchParams.get("groupId")?.trim() || undefined;

  const where: Parameters<typeof prisma.user.findMany>[0]["where"] = {
    role: Role.client,
    archivedAt: archived === "true" ? { not: null } : null,
  };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }
  if (groupId) {
    where.clientGroups = { some: { groupId } };
  }

  const clients = await prisma.user.findMany({
    where,
    include: { clientProfile: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(clients);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { email, name, password, phone, dateOfBirth, timezone } = body;
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }
    const pass = typeof password === "string" && password.length >= 8 ? password : undefined;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 });
    }
    const passwordHash = pass
      ? await hash(pass, 10)
      : await hash("changeme123", 10); // default temp password
    const user = await prisma.user.create({
      data: {
        email,
        name: typeof name === "string" ? name : null,
        passwordHash,
        role: Role.client,
        clientProfile: {
          create: {
            phone: typeof phone === "string" ? phone : null,
            timezone: typeof timezone === "string" ? timezone : null,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            clientSettings: {
              create: {
                workoutComments: true,
                workoutVisibility: true,
                allowRearrange: false,
                replaceExercise: false,
                allowCreateWorkouts: false,
              },
            },
          },
        },
      },
      include: { clientProfile: { include: { clientSettings: true } } },
    });
    return NextResponse.json(user);
  } catch (e) {
    console.error("Create client error:", e);
    return NextResponse.json({ error: "Failed to create client." }, { status: 500 });
  }
}
