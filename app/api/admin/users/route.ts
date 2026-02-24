import { NextResponse } from "next/server";
import { requireAdmin, apiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import { Prisma, Role } from "@prisma/client";
import { createUserWithRole } from "@/lib/user-create";

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  const { searchParams } = new URL(request.url);
  const roleParam = searchParams.get("role");
  const search = searchParams.get("search")?.trim();

  const where: Prisma.UserWhereInput = {};
  if (roleParam === "admin" || roleParam === "client") {
    where.role = roleParam as Role;
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" as const } },
      { email: { contains: search, mode: "insensitive" as const } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      archivedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  try {
    const body = await request.json();
    const email = body.email;
    const name = body.name;
    const password = body.password;
    const role = body.role;

    if (!email || typeof email !== "string") {
      return apiError("Email is required.", 400);
    }
    if (role !== "admin" && role !== "client") {
      return apiError("Role must be admin or client.", 400);
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return apiError("A user with this email already exists.", 409);
    }

    const user = await createUserWithRole(prisma, {
      email,
      name: typeof name === "string" ? name : null,
      password: typeof password === "string" && password.length >= 8 ? password : undefined,
      role: role as Role,
      phone: typeof body.phone === "string" ? body.phone : null,
      timezone: typeof body.timezone === "string" ? body.timezone : null,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
    });
    return NextResponse.json(user);
  } catch (e) {
    return apiError("Failed to create user.", 500, e);
  }
}
