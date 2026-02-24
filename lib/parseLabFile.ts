/**
 * Parser for Genr8 lab DNA result files (GSGT format).
 * Sample: DSC042739_NicoleTorosin.txt
 * Format: [Header] block (key\tvalue), then [Data] block (tab-delimited table).
 * We only parse metadata (header + data column names); raw SNP data is not mapped to interpretation fields.
 */

const MAX_BYTES = 100 * 1024; // 100KB enough for header + data header row

export type LabFileParseResult = {
  ok: true;
  header: Record<string, string>;
  dataColumns: string[];
  sampleId?: string;
  processingDate?: string;
  gender?: string;
  numSnps?: string;
  summary: string;
} | {
  ok: false;
  error: string;
};

/**
 * Parse the first portion of a lab file. Returns metadata for preview; does not read full SNP data.
 */
export function parseLabFile(buffer: Buffer): LabFileParseResult {
  const str = buffer.subarray(0, MAX_BYTES).toString("utf8");
  const lines = str.split(/\r?\n/);

  const header: Record<string, string> = {};
  let dataColumns: string[] = [];
  let firstDataRow: string[] | null = null;
  let inHeader = false;
  let inData = false;
  let dataHeaderDone = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "[Header]") {
      inHeader = true;
      inData = false;
      continue;
    }
    if (trimmed === "[Data]") {
      inHeader = false;
      inData = true;
      dataHeaderDone = false;
      continue;
    }

    if (inHeader && trimmed) {
      const tabIdx = trimmed.indexOf("\t");
      const spaceMatch = trimmed.match(/^(\S+)\s{2,}(.*)$/);
      if (tabIdx >= 0) {
        const key = trimmed.slice(0, tabIdx).trim();
        const value = trimmed.slice(tabIdx + 1).trim();
        if (key) header[key] = value;
      } else if (spaceMatch) {
        const [, key, value] = spaceMatch;
        if (key) header[key] = (value ?? "").trim();
      }
    }

    if (inData && trimmed) {
      if (!dataHeaderDone) {
        dataColumns = trimmed.split("\t").map((c) => c.trim());
        dataHeaderDone = true;
      } else {
        firstDataRow = trimmed.split("\t").map((c) => c.trim());
        break;
      }
    }
  }

  const sampleId =
    header["Sample ID"] ??
    (firstDataRow && firstDataRow[0] ? firstDataRow[0] : undefined);
  const processingDate = header["Processing Date"];
  const gender = header["Gender"];
  const numSnps = header["Num SNPs"] ?? header["Total SNPs"];

  const parts: string[] = [];
  if (sampleId) parts.push(`Sample: ${sampleId}`);
  if (processingDate) parts.push(`Processed: ${processingDate}`);
  if (gender) parts.push(`Gender: ${gender}`);
  if (numSnps) parts.push(`SNPs: ${numSnps}`);
  const summary = parts.length > 0 ? parts.join(" · ") : "Lab file recognized (no header metadata).";

  return {
    ok: true,
    header,
    dataColumns,
    sampleId: sampleId || undefined,
    processingDate: processingDate || undefined,
    gender: gender || undefined,
    numSnps: numSnps || undefined,
    summary,
  };
}

/**
 * Check if the file looks like this lab format (has [Header] and [Data]).
 */
export function isLabFileFormat(buffer: Buffer): boolean {
  const str = buffer.subarray(0, 2048).toString("utf8");
  return str.includes("[Header]") && str.includes("[Data]");
}
