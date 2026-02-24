import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 10 MB)." }, { status: 400 });
    }
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "File upload not configured. Set BLOB_READ_WRITE_TOKEN for Vercel Blob." },
        { status: 503 }
      );
    }
    const blob = await put(`dna/${Date.now()}-${file.name}`, file, { access: "public" });
    return NextResponse.json({ url: blob.url });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
