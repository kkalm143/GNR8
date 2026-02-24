import type { NextResponse } from "next/server";

export const VIEW_AS_COOKIE_NAME = "gnr8_viewAs";
export const VIEW_AS_COOKIE_VALUE_CLIENT = "client";

const COOKIE_OPTIONS = {
  path: "/",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 30, // 30 days
};

/** Cookie store from next/headers cookies() — has get(name) returning { value }. */
export interface CookieStore {
  get(name: string): { value: string } | undefined;
}

/**
 * Read the view-as value from request cookies (e.g. from cookies() in layout).
 */
export function getViewAsFromCookies(cookies: CookieStore): string | undefined {
  return cookies.get(VIEW_AS_COOKIE_NAME)?.value;
}

/**
 * Returns true when the client layout should redirect an admin to /admin
 * (i.e. admin is not in "view as client" mode).
 */
export function shouldRedirectAdminAwayFromClientApp(
  sessionRole: string | undefined,
  viewAsCookieValue: string | undefined
): boolean {
  if (sessionRole !== "admin") return false;
  return viewAsCookieValue !== VIEW_AS_COOKIE_VALUE_CLIENT;
}

/**
 * Set the view-as-client cookie on a redirect response.
 * Call this before returning the response from the view-as-client API route.
 */
export function setViewAsClientCookie<T extends NextResponse>(response: T): T {
  response.cookies.set(VIEW_AS_COOKIE_NAME, VIEW_AS_COOKIE_VALUE_CLIENT, {
    ...COOKIE_OPTIONS,
    httpOnly: true,
  });
  return response;
}

/**
 * Clear the view-as cookie on a redirect response.
 * Call this before returning the response from the view-as-clear API route.
 */
export function clearViewAsCookie<T extends NextResponse>(response: T): T {
  response.cookies.set(VIEW_AS_COOKIE_NAME, "", {
    path: "/",
    sameSite: "lax",
    maxAge: 0,
  });
  return response;
}
