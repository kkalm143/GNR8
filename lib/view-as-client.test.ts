import { describe, it, expect } from "vitest";
import {
  getViewAsFromCookies,
  shouldRedirectAdminAwayFromClientApp,
  VIEW_AS_COOKIE_NAME,
  VIEW_AS_COOKIE_VALUE_CLIENT,
  type CookieStore,
} from "./view-as-client";

describe("getViewAsFromCookies", () => {
  it("returns cookie value when set", () => {
    const cookies: CookieStore = {
      get: (name) =>
        name === VIEW_AS_COOKIE_NAME
          ? { value: VIEW_AS_COOKIE_VALUE_CLIENT }
          : undefined,
    };
    expect(getViewAsFromCookies(cookies)).toBe(VIEW_AS_COOKIE_VALUE_CLIENT);
  });

  it("returns undefined when cookie not set", () => {
    const cookies: CookieStore = { get: () => undefined };
    expect(getViewAsFromCookies(cookies)).toBeUndefined();
  });
});

describe("shouldRedirectAdminAwayFromClientApp", () => {
  it("returns true when admin and no viewAs cookie", () => {
    expect(
      shouldRedirectAdminAwayFromClientApp("admin", undefined)
    ).toBe(true);
  });

  it("returns true when admin and viewAs is not client", () => {
    expect(shouldRedirectAdminAwayFromClientApp("admin", "other")).toBe(true);
  });

  it("returns false when admin and viewAs is client", () => {
    expect(
      shouldRedirectAdminAwayFromClientApp("admin", VIEW_AS_COOKIE_VALUE_CLIENT)
    ).toBe(false);
  });

  it("returns false when role is client (regardless of cookie)", () => {
    expect(
      shouldRedirectAdminAwayFromClientApp("client", undefined)
    ).toBe(false);
    expect(
      shouldRedirectAdminAwayFromClientApp("client", VIEW_AS_COOKIE_VALUE_CLIENT)
    ).toBe(false);
  });

  it("returns false when role is undefined", () => {
    expect(
      shouldRedirectAdminAwayFromClientApp(undefined, undefined)
    ).toBe(false);
  });
});
