import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db", () => ({
  prisma: {
    user: { findFirst: vi.fn() },
    message: { create: vi.fn() },
  },
}));

const auth = (await import("@/lib/auth")).auth;
const prisma = (await import("@/lib/db")).prisma;

describe("POST /api/admin/clients/[id]/messages", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
    vi.mocked(prisma.user.findFirst).mockReset();
    vi.mocked(prisma.message.create).mockReset();
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const res = await POST(
      new Request("http://localhost/api/admin/clients/c1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: "Hello" }),
      }),
      { params: Promise.resolve({ id: "c1" }) }
    );
    expect(res.status).toBe(401);
  });

  it("returns 401 when not admin", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "c2", role: "client" } } as any);
    const res = await POST(
      new Request("http://localhost/api/admin/clients/c1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: "Hello" }),
      }),
      { params: Promise.resolve({ id: "c1" }) }
    );
    expect(res.status).toBe(401);
  });

  it("returns 404 when client not found", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);
    const res = await POST(
      new Request("http://localhost/api/admin/clients/c1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: "Hello" }),
      }),
      { params: Promise.resolve({ id: "c1" }) }
    );
    expect(res.status).toBe(404);
  });

  it("returns 400 when body is missing", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: "c1", role: "client" } as any);
    const res = await POST(
      new Request("http://localhost/api/admin/clients/c1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
      { params: Promise.resolve({ id: "c1" }) }
    );
    expect(res.status).toBe(400);
  });

  it("returns 201 and creates message when admin sends to client", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    vi.mocked(prisma.user.findFirst).mockResolvedValue({ id: "c1", role: "client" } as any);
    vi.mocked(prisma.message.create).mockResolvedValue({
      id: "m1",
      subject: "Update",
      body: "Check your program.",
      senderId: "a1",
      recipientId: "c1",
      readAt: null,
      createdAt: new Date(),
    } as any);
    const res = await POST(
      new Request("http://localhost/api/admin/clients/c1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: "Update", body: "Check your program." }),
      }),
      { params: Promise.resolve({ id: "c1" }) }
    );
    expect(res.status).toBe(201);
    expect(prisma.message.create).toHaveBeenCalledWith({
      data: {
        senderId: "a1",
        recipientId: "c1",
        subject: "Update",
        body: "Check your program.",
      },
    });
  });
});
