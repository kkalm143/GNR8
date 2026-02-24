import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db", () => ({
  prisma: {
    exercise: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

const auth = (await import("@/lib/auth")).auth;
const prisma = (await import("@/lib/db")).prisma;

describe("GET /api/admin/exercises", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
  });

  it("returns 401 when not admin", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const res = await GET(new Request("http://localhost/api/admin/exercises"));
    expect(res.status).toBe(401);
  });

  it("returns 200 with exercises when admin", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    vi.mocked(prisma.exercise.findMany).mockResolvedValue([
      { id: "e1", name: "Squat", description: null, demoVideoUrl: null, source: "library", createdAt: new Date(), updatedAt: new Date() },
    ] as any);
    const res = await GET(new Request("http://localhost/api/admin/exercises"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data[0].name).toBe("Squat");
  });
});

describe("POST /api/admin/exercises", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
    vi.mocked(prisma.exercise.create).mockResolvedValue({
      id: "e1",
      name: "Bench Press",
      description: "Chest",
      demoVideoUrl: null,
      source: "library",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
  });

  it("returns 401 when not admin", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const res = await POST(
      new Request("http://localhost/api/admin/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Bench Press" }),
      })
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 when name missing", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    const res = await POST(
      new Request("http://localhost/api/admin/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 200 with created exercise", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    const res = await POST(
      new Request("http://localhost/api/admin/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Bench Press", description: "Chest" }),
      })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe("Bench Press");
  });
});
