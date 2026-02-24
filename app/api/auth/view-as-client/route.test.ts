import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { GET } from "./route";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/api-helpers", () => ({
  requireAuth: vi.fn(),
}));

const requireAuth = (await import("@/lib/api-helpers")).requireAuth;

describe("GET /api/auth/view-as-client", () => {
  beforeEach(() => {
    vi.mocked(requireAuth).mockReset();
  });

  it("redirects to login when not authenticated", async () => {
    vi.mocked(requireAuth).mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    );
    const req = new Request("http://localhost/api/auth/view-as-client");
    const res = await GET(req);
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toContain("/login");
  });

  it("redirects to dashboard without Set-Cookie when authenticated as client", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      user: { id: "u1", email: "c@test.com", role: "client" },
    } as any);
    const req = new Request("http://localhost/api/auth/view-as-client");
    const res = await GET(req);
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toContain("/dashboard");
    const setCookie = res.headers.get("Set-Cookie");
    expect(setCookie).toBeNull();
  });

  it("redirects to dashboard with Set-Cookie when authenticated as admin", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      user: { id: "a1", email: "admin@test.com", role: "admin" },
    } as any);
    const req = new Request("http://localhost/api/auth/view-as-client");
    const res = await GET(req);
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toContain("/dashboard");
    const setCookie = res.headers.get("Set-Cookie");
    expect(setCookie).toBeDefined();
    expect(setCookie).toContain("gnr8_viewAs");
    expect(setCookie).toContain("client");
  });
});
