import { describe, it, expect } from "vitest";
import { parseLabFile, isLabFileFormat } from "./parseLabFile";

const minimalValidFile = `[Header]
GSGT Version\t2.0.4
Processing Date\t7/31/2025 12:56 PM
Gender    Female
Num SNPs\t671521
[Data]
Sample ID\tSNP Name\tChr\tPosition\tAllele1 - Forward\tAllele2 - Forward
DSC042739\t1:103380393\t1\t103380393\tG\tG
`;

describe("isLabFileFormat", () => {
  it("returns true when buffer contains [Header] and [Data]", () => {
    expect(isLabFileFormat(Buffer.from(minimalValidFile, "utf8"))).toBe(true);
  });

  it("returns false for empty buffer", () => {
    expect(isLabFileFormat(Buffer.alloc(0))).toBe(false);
  });

  it("returns false when only [Header] present", () => {
    expect(isLabFileFormat(Buffer.from("[Header]\nKey\tValue", "utf8"))).toBe(false);
  });

  it("returns false when only [Data] present", () => {
    expect(isLabFileFormat(Buffer.from("[Data]\nA\tB", "utf8"))).toBe(false);
  });

  it("returns false for plain text without sections", () => {
    expect(isLabFileFormat(Buffer.from("hello world", "utf8"))).toBe(false);
  });
});

describe("parseLabFile", () => {
  it("parses valid GSGT file with tab-separated header and data row", () => {
    const buf = Buffer.from(minimalValidFile, "utf8");
    const result = parseLabFile(buf);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.sampleId).toBe("DSC042739");
    expect(result.processingDate).toBe("7/31/2025 12:56 PM");
    expect(result.gender).toBe("Female");
    expect(result.numSnps).toBe("671521");
    expect(result.summary).toContain("DSC042739");
    expect(result.summary).toContain("7/31/2025");
    expect(result.summary).toContain("Female");
    expect(result.summary).toContain("671521");
    expect(result.dataColumns).toEqual([
      "Sample ID",
      "SNP Name",
      "Chr",
      "Position",
      "Allele1 - Forward",
      "Allele2 - Forward",
    ]);
    expect(result.header["GSGT Version"]).toBe("2.0.4");
  });

  it("parses header with space-separated key-value (e.g. Gender    Female)", () => {
    const file = `[Header]
Gender    Female
[Data]
Sample ID\tSNP Name
SAMPLE1\trs123
`;
    const result = parseLabFile(Buffer.from(file, "utf8"));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.header["Gender"]).toBe("Female");
    expect(result.gender).toBe("Female");
    expect(result.summary).toContain("Female");
  });

  it("returns sampleId from first data row when not in header", () => {
    const file = `[Header]
Processing Date\t1/1/2025
[Data]
Sample ID\tSNP Name
DSC999\t1:123
`;
    const result = parseLabFile(Buffer.from(file, "utf8"));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.sampleId).toBe("DSC999");
  });

  it("handles only [Header] and [Data] header row (no data row)", () => {
    const file = `[Header]
Num SNPs\t100
[Data]
Sample ID\tSNP Name
`;
    const result = parseLabFile(Buffer.from(file, "utf8"));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.dataColumns).toEqual(["Sample ID", "SNP Name"]);
    expect(result.summary).toContain("100");
  });

  it("handles empty buffer without throwing", () => {
    const result = parseLabFile(Buffer.alloc(0));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.summary).toBe("Lab file recognized (no header metadata).");
    expect(Object.keys(result.header)).toHaveLength(0);
  });

  it("handles buffer without [Header] or [Data] sections", () => {
    const result = parseLabFile(Buffer.from("some other file content", "utf8"));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.summary).toBe("Lab file recognized (no header metadata).");
  });

  it("uses only first 100KB of buffer", () => {
    const head = "[Header]\nKey\tValue\n[Data]\nA\tB\nx\ty\n";
    const padding = "z".repeat(150 * 1024);
    const result = parseLabFile(Buffer.from(head + padding, "utf8"));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.dataColumns).toEqual(["A", "B"]);
    expect(result.sampleId).toBe("x");
  });
});
