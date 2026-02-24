import { describe, it, expect } from "vitest";
import { GET } from "./route";

describe("GET /api/auth/view-as-clear", () => {
  it("redirects to admin and clears cookie", async () => {
    const req = new Request("http://localhost/api/auth/view-as-clear");
    const res = await GET(req);
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toContain("/admin");
    const setCookie = res.headers.get("Set-Cookie");
    expect(setCookie).toBeDefined();
    expect(setCookie).toContain("gnr8_viewAs");
    expect(setCookie).toMatch(/Max-Age=0|max-age=0/);
  });
});
