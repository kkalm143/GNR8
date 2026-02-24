import { NextResponse } from "next/server";
import { requireAdmin, apiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import { hash } from "bcrypt";
import { Role } from "@prisma/client";

const MIN_BULK = 2;
const MAX_BULK = 8;

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  try {
    const body = await request.json();
    const { clients } = body;
    if (!Array.isArray(clients) || clients.length < MIN_BULK || clients.length > MAX_BULK) {
      return apiError(
        `clients must be an array of between ${MIN_BULK} and ${MAX_BULK} items.`,
        400
      );
    }
    const created: Array<{ id: string; email: string; name: string | null }> = [];
    const errors: Array<{ index: number; email?: string; error: string }> = [];
    for (let i = 0; i < clients.length; i++) {
      const c = clients[i];
      const email = typeof c?.email === "string" ? c.email.trim() : "";
      if (!email) {
        errors.push({ index: i, error: "Email is required." });
        continue;
      }
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        errors.push({ index: i, email, error: "A user with this email already exists." });
        continue;
      }
      const name = typeof c?.name === "string" ? c.name.trim() || null : null;
      const phone = typeof c?.phone === "string" ? c.phone.trim() || null : null;
      const timezone = typeof c?.timezone === "string" ? c.timezone.trim() || null : null;
      const dateOfBirth = c?.dateOfBirth ? new Date(c.dateOfBirth) : null;
      const passwordHash = await hash("changeme123", 10);
      const user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
          role: Role.client,
          clientProfile: {
            create: {
              phone,
              timezone,
              dateOfBirth: dateOfBirth && !isNaN(dateOfBirth.getTime()) ? dateOfBirth : null,
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
        select: { id: true, email: true, name: true },
      });
      created.push(user);
    }
    return NextResponse.json({ created, errors: errors.length ? errors : undefined });
  } catch (e) {
    console.error("Bulk create clients error:", e);
    return apiError("Failed to create clients.", 500);
  }
}
