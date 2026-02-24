import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const role = (session.user as { role?: string }).role;
  if (role === "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const message = await prisma.message.findFirst({
    where: { id, recipientId: session.user.id },
    include: {
      sender: { select: { id: true, name: true } },
    },
  });
  if (!message) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(message);
}
