import { NextResponse } from "next/server";
import { requireAdmin, apiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import { put } from "@vercel/blob";
import { Role } from "@prisma/client";

const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  const { id: userId } = await params;
  const client = await prisma.user.findFirst({
    where: { id: userId, role: Role.client },
    include: { clientProfile: true },
  });
  if (!client?.clientProfile?.consultationFileUrl) {
    return apiError("No consultation file attached.", 404);
  }
  return NextResponse.redirect(client.clientProfile.consultationFileUrl, 302);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  const { id: userId } = await params;
  const client = await prisma.user.findFirst({
    where: { id: userId, role: Role.client },
    include: { clientProfile: true },
  });
  if (!client?.clientProfile) {
    return apiError("Client not found.", 404);
  }
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file || !(file instanceof File)) {
      return apiError("No file provided.", 400);
    }
    if (file.size > MAX_SIZE) {
      return apiError("File too large (max 20 MB).", 400);
    }
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return apiError("File upload not configured. Set BLOB_READ_WRITE_TOKEN.", 503);
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
    return apiError("Upload failed.", 500);
  }
}
