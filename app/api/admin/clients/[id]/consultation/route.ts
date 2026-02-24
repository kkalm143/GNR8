import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { put } from "@vercel/blob";
import { Role } from "@prisma/client";

const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

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
  if (!client?.clientProfile?.consultationFileUrl) {
    return NextResponse.json({ error: "No consultation file attached." }, { status: 404 });
  }
  return NextResponse.redirect(client.clientProfile.consultationFileUrl, 302);
}

export async function POST(
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
  if (!client?.clientProfile) {
    return NextResponse.json({ error: "Client not found." }, { status: 404 });
  }
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 20 MB)." }, { status: 400 });
    }
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "File upload not configured. Set BLOB_READ_WRITE_TOKEN." },
        { status: 503 }
      );
    }
    const blob = await put(
      `consultation/${userId}/${Date.now()}-${file.name}`,
      file,
      { access: "public" }
    );
    await prisma.clientProfile.update({
      where: { id: client.clientProfile.id },
      data: { consultationFileUrl: blob.url },
    });
    return NextResponse.json({ url: blob.url });
  } catch (e) {
    console.error("Consultation upload error:", e);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
