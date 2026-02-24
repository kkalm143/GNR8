import { describe, it, expect, vi, beforeEach } from "vitest";
import { PATCH } from "./route";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db", () => ({
  prisma: {
    clientProfile: { findFirst: vi.fn(), update: vi.fn(), create: vi.fn() },
    user: { findUnique: vi.fn() },
  },
}));

const auth = (await import("@/lib/auth")).auth;
const prisma = (await import("@/lib/db")).prisma;

describe("PATCH /api/me/onboarding", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
    vi.mocked(prisma.clientProfile.findFirst).mockReset();
    vi.mocked(prisma.clientProfile.update).mockReset();
    vi.mocked(prisma.clientProfile.create).mockReset();
    vi.mocked(prisma.user.findUnique).mockReset();
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const res = await PATCH(
      new Request("http://localhost/api/me/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      })
    );
    expect(res.status).toBe(401);
  });

  it("returns 403 when user is admin", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    const res = await PATCH(
      new Request("http://localhost/api/me/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      })
    );
    expect(res.status).toBe(403);
  });

  it("returns 400 when body is invalid", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "c1", role: "client" } } as any);
    const res = await PATCH(
      new Request("http://localhost/api/me/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
    );
    expect(res.status).toBe(400);
  });

  it("sets onboardingCompletedAt when completed: true and profile exists", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "c1", role: "client" } } as any);
    vi.mocked(prisma.clientProfile.findFirst).mockResolvedValue({
      id: "cp1",
      userId: "c1",
    } as any);
    vi.mocked(prisma.clientProfile.update).mockResolvedValue({
      id: "cp1",
      onboardingCompletedAt: new Date(),
    } as any);
    const res = await PATCH(
      new Request("http://localhost/api/me/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      })
    );
    expect(res.status).toBe(200);
    expect(prisma.clientProfile.update).toHaveBeenCalledWith({
      where: { userId: "c1" },
      data: { onboardingCompletedAt: expect.any(Date) },
    });
  });

  it("clears onboardingCompletedAt when completed: false (show again)", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "c1", role: "client" } } as any);
    vi.mocked(prisma.clientProfile.findFirst).mockResolvedValue({
      id: "cp1",
      userId: "c1",
    } as any);
    vi.mocked(prisma.clientProfile.update).mockResolvedValue({
      id: "cp1",
      onboardingCompletedAt: null,
    } as any);
    const res = await PATCH(
      new Request("http://localhost/api/me/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: false }),
      })
    );
    expect(res.status).toBe(200);
    expect(prisma.clientProfile.update).toHaveBeenCalledWith({
      where: { userId: "c1" },
      data: { onboardingCompletedAt: null },
    });
  });
});
