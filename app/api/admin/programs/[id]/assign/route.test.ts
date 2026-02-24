import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db", () => ({
  prisma: {
    program: { findUnique: vi.fn() },
    user: { findFirst: vi.fn() },
    programAssignment: { findUnique: vi.fn(), create: vi.fn() },
  },
}));

const auth = (await import("@/lib/auth")).auth;
const prisma = (await import("@/lib/db")).prisma;

describe("POST /api/admin/programs/[id]/assign", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
    vi.mocked(prisma.program.findUnique).mockResolvedValue({ id: "p1", name: "Program A" } as any);
    vi.mocked(prisma.user.findFirst).mockImplementation((args: { where: { id: string; role: string } }) =>
      Promise.resolve(args.where.role === "client" ? ({ id: args.where.id, role: "client" } as any) : null)
    );
    vi.mocked(prisma.programAssignment.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.programAssignment.create).mockImplementation((args: { data: { userId: string; programId: string } }) =>
      Promise.resolve({
        id: "pa-" + args.data.userId,
        userId: args.data.userId,
        programId: args.data.programId,
        status: "assigned",
        assignedAt: new Date(),
        startDate: null,
        endDate: null,
        notes: null,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any)
    );
  });

  it("returns 401 when not admin", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const res = await POST(
      new Request("http://localhost/api/admin/programs/p1/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: ["u1", "u2"] }),
      }),
      { params: Promise.resolve({ id: "p1" }) }
    );
    expect(res.status).toBe(401);
  });

  it("returns 404 when program not found", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    vi.mocked(prisma.program.findUnique).mockResolvedValue(null);
    const res = await POST(
      new Request("http://localhost/api/admin/programs/p1/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: ["u1"] }),
      }),
      { params: Promise.resolve({ id: "p1" }) }
    );
    expect(res.status).toBe(404);
  });

  it("returns 400 when userIds missing or not array", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    const res = await POST(
      new Request("http://localhost/api/admin/programs/p1/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
      { params: Promise.resolve({ id: "p1" }) }
    );
    expect(res.status).toBe(400);
  });

  it("returns 200 with assigned when success", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    const res = await POST(
      new Request("http://localhost/api/admin/programs/p1/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: ["u1", "u2"], startDate: "2025-03-01", endDate: "2025-03-31" }),
      }),
      { params: Promise.resolve({ id: "p1" }) }
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.assigned)).toBe(true);
    expect(data.assigned.length).toBe(2);
    expect(prisma.programAssignment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "u1",
          programId: "p1",
          startDate: new Date("2025-03-01"),
          endDate: new Date("2025-03-31"),
        }),
      })
    );
  });
});
