import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import fs from "fs";
import path from "path";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

const auth = await import("@/lib/auth").then((m) => m.auth);

describe("POST /api/admin/parse-dna-file", () => {
  beforeEach(() => {
    vi.mocked(auth).mockReset();
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const formData = new FormData();
    formData.set("file", new File(["x"], "x.txt"));
    const req = new Request("http://localhost/api/admin/parse-dna-file", {
      method: "POST",
      body: formData,
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 when user is not admin", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "u1", email: "c@test.com", role: "client" },
    } as any);
    const formData = new FormData();
    formData.set("file", new File(["x"], "x.txt"));
    const req = new Request("http://localhost/api/admin/parse-dna-file", {
      method: "POST",
      body: formData,
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when no file provided", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "a1", email: "admin@test.com", role: "admin" },
    } as any);
    const formData = new FormData();
    const req = new Request("http://localhost/api/admin/parse-dna-file", {
      method: "POST",
      body: formData,
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("No file");
  });

  it("returns 400 when file is empty", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "a1", email: "admin@test.com", role: "admin" },
    } as any);
    const formData = new FormData();
    formData.set("file", new File([], "empty.txt"));
    const req = new Request("http://localhost/api/admin/parse-dna-file", {
      method: "POST",
      body: formData,
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("empty");
  });

  it("returns 400 when file is not lab format", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "a1", email: "admin@test.com", role: "admin" },
    } as any);
    const formData = new FormData();
    formData.set("file", new File(["not a lab file"], "other.txt"));
    const req = new Request("http://localhost/api/admin/parse-dna-file", {
      method: "POST",
      body: formData,
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("lab DNA report");
  });

  it("returns 200 with parsed summary and metadata for valid GSGT file", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "a1", email: "admin@test.com", role: "admin" },
    } as any);
    const fixturePath = path.join(
      process.cwd(),
      "tests",
      "fixtures",
      "sample-lab-file.txt"
    );
    const content = fs.readFileSync(fixturePath);
    const formData = new FormData();
    formData.set("file", new File([content], "sample-lab-file.txt"));
    const req = new Request("http://localhost/api/admin/parse-dna-file", {
      method: "POST",
      body: formData,
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.summary).toContain("DSC042739");
    expect(data.summary).toContain("7/31/2025");
    expect(data.sampleId).toBe("DSC042739");
    expect(data.processingDate).toBe("7/31/2025 12:56 PM");
    expect(data.gender).toBe("Female");
    expect(data.numSnps).toBe("671521");
    expect(Array.isArray(data.dataColumns)).toBe(true);
    expect(data.dataColumns).toContain("Sample ID");
  });
});
