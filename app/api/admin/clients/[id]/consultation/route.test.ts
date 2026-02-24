import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db", () => ({
  prisma: {
    user: { findFirst: vi.fn() },
    clientProfile: { update: vi.fn() },
  },
}));
vi.mock("@vercel/blob", () => ({ put: vi.fn() }));

const auth = (await import("@/lib/auth")).auth;
const prisma = (await import("@/lib/db")).prisma;
const { put } = await import("@vercel/blob");

describe("GET /api/admin/clients/[id]/consultation", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      id: "c1",
      role: "client",
      clientProfile: { id: "cp1", consultationFileUrl: "https://blob.example.com/file.pdf" },
    } as any);
  });

  it("returns 401 when not admin", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const res = await GET(new Request("http://localhost/api/admin/clients/c1/consultation"), { params: Promise.resolve({ id: "c1" }) });
    expect(res.status).toBe(401);
  });

  it("returns 404 when no consultation file", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      id: "c1",
      role: "client",
      clientProfile: { id: "cp1", consultationFileUrl: null },
    } as any);
    const res = await GET(new Request("http://localhost/api/admin/clients/c1/consultation"), { params: Promise.resolve({ id: "c1" }) });
    expect(res.status).toBe(404);
  });

  it("returns 302 redirect to file URL when file exists", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    const res = await GET(new Request("http://localhost/api/admin/clients/c1/consultation"), { params: Promise.resolve({ id: "c1" }) });
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("https://blob.example.com/file.pdf");
  });
});

describe("POST /api/admin/clients/[id]/consultation", () => {
  beforeEach(() => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "a1", role: "admin" } } as any);
    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      id: "c1",
      role: "client",
      clientProfile: { id: "cp1", consultationFileUrl: null },
    } as any);
    vi.mocked(put).mockResolvedValue({ url: "https://blob.example.com/consultation.pdf" } as any);
    vi.mocked(prisma.clientProfile.update).mockResolvedValue({
      id: "cp1",
      consultationFileUrl: "https://blob.example.com/consultation.pdf",
    } as any);
  });

  it("returns 401 when not admin", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const form = new FormData();
    form.set("file", new File(["x"], "doc.pdf", { type: "application/pdf" }));
    const res = await POST(
      new Request("http://localhost/api/admin/clients/c1/consultation", { method: "POST", body: form }),
      { params: Promise.resolve({ id: "c1" }) }
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 when no file", async () => {
    const res = await POST(
      new Request("http://localhost/api/admin/clients/c1/consultation", { method: "POST", body: new FormData() }),
      { params: Promise.resolve({ id: "c1" }) }
    );
    expect(res.status).toBe(400);
  });

  it("returns 200 with url when upload succeeds", async () => {
    const orig = process.env.BLOB_READ_WRITE_TOKEN;
    try {
      process.env.BLOB_READ_WRITE_TOKEN = "test-token";
      const form = new FormData();
      form.set("file", new File(["x"], "doc.pdf", { type: "application/pdf" }));
      const res = await POST(
        new Request("http://localhost/api/admin/clients/c1/consultation", { method: "POST", body: form }),
        { params: Promise.resolve({ id: "c1" }) }
      );
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.url).toBe("https://blob.example.com/consultation.pdf");
    } finally {
      if (orig !== undefined) process.env.BLOB_READ_WRITE_TOKEN = orig;
      else delete process.env.BLOB_READ_WRITE_TOKEN;
    }
  });
});
