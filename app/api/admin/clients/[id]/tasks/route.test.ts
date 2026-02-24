import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db", () => ({
  prisma: {
    user: { findFirst: vi.fn() },
    task: { create: vi.fn() },
  },
}));

const auth = (await import("@/lib/auth")).auth;
const prisma = (await import("@/lib/db")).prisma;

describe("POST /api/admin/clients/[id]/tasks", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
    vi.mocked(prisma.user.findFirst).mockReset();
    vi.mocked(prisma.task.create).mockReset();
  });

  it("returns 401 when not admin", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const res = await POST(
      new Request("http://localhost/api/admin/clients/c1/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Do something" }),
      }),
      { params: Promise.resolve({ id: "c1" }) }
    );
    expect(res.status).toBe(401);
  });

  it("returns 404 when client not found", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);
    const res = await POST(
      new Request("http://localhost/api/admin/clients/c1/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Do something" }),
      }),
      { params: Promise.resolve({ id: "c1" }) }
    );
    expect(res.status).toBe(404);
  });

  it("returns 201 and creates task when admin assigns to client", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: "c1", role: "client" } as any);
    vi.mocked(prisma.task.create).mockResolvedValue({
      id: "t1",
      title: "Submit form",
      dueDate: new Date(),
      completedAt: null,
    } as any);
    const res = await POST(
      new Request("http://localhost/api/admin/clients/c1/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Submit form", description: "Please complete.", dueDate: "2025-03-01" }),
      }),
      { params: Promise.resolve({ id: "c1" }) }
    );
    expect(res.status).toBe(201);
    expect(prisma.task.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        assignedToUserId: "c1",
        assignedByUserId: "a1",
        title: "Submit form",
        description: "Please complete.",
      }),
    });
  });
});
