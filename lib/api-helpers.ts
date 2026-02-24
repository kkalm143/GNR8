import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { Session } from "next-auth";

/**
 * Require an authenticated session. Returns 401 response if not logged in.
 * Use session.user.id and session.user.role (typed) in the route handler.
 */
export async function requireAuth(): Promise<
  Session | NextResponse<unknown>
> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session as Session;
}

/**
 * Require an admin session. Returns 401 if not logged in or not admin.
 */
export async function requireAdmin(): Promise<
  Session | NextResponse<unknown>
> {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session as Session;
}

/**
 * Require a client session (not admin). Returns 401 if not logged in, 403 if admin.
 */
export async function requireClient(): Promise<
  Session | NextResponse<unknown>
> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role === "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return session as Session;
}

/**
 * Return a JSON error response with the given message and status code.
 */
export function apiError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}
