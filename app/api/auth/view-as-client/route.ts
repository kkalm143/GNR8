import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import { setViewAsClientCookie } from "@/lib/view-as-client";

const DASHBOARD_URL = "/dashboard";
const LOGIN_URL = "/login";

export async function GET(request: Request) {
  const session = await requireAuth();
  if (session instanceof NextResponse) {
    return NextResponse.redirect(new URL(LOGIN_URL, request.url), 302);
  }
  const role = session.user.role;
  const url = new URL(DASHBOARD_URL, request.url);
  const response = NextResponse.redirect(url, 302);
  if (role === "admin") {
    setViewAsClientCookie(response);
  }
  return response;
}
