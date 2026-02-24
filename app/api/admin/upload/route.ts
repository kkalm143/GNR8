import { NextResponse } from "next/server";
import { requireAdmin, apiError } from "@/lib/api-helpers";
import { put } from "@vercel/blob";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file || !(file instanceof File)) {
      return apiError("No file provided.", 400);
    }
    if (file.size > MAX_SIZE) {
      return apiError("File too large (max 10 MB).", 400);
    }
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return apiError("File upload not configured. Set BLOB_READ_WRITE_TOKEN for Vercel Blob.", 503);
    }
    const blob = await put(`dna/${Date.now()}-${file.name}`, file, { access: "public" });
    return NextResponse.json({ url: blob.url });
  } catch (e) {
    console.error("Upload error:", e);
    return apiError("Upload failed.", 500);
  }
}
