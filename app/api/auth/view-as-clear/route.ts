import { NextResponse } from "next/server";
import { clearViewAsCookie } from "@/lib/view-as-client";

const ADMIN_URL = "/admin";

export async function GET(request: Request) {
  const url = new URL(ADMIN_URL, request.url);
  const response = NextResponse.redirect(url, 302);
  clearViewAsCookie(response);
  return response;
}
