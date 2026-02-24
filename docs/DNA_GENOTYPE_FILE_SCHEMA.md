# DNA Genetic Test File Schema

**Source file:** `DSC042739_NicoleTorosin.txt`  
**Format:** GSGT (GenomeStudio Genotyping) tab-delimited export  
**Assay:** AKESOgen GSAv3 Custom array (Illumina Global Screening Array variant)

---

## 1. File structure overview

The file has two sections:

1. **Header** — metadata key-value pairs (lines 1–12).
2. **Data** — single header row followed by one row per SNP call per sample (tab-delimited).

**Delimiter:** Tab (`\t`) in both header values and data columns.  
**Line endings:** Presumed CRLF or LF.

---

## 2. Header section

- **Start marker:** `[Header]` on line 1.
- **End marker:** `[Data]` on line 12 (first line of data section).
- **Lines 2–11:** Key-value pairs in the form `Key<TAB>Value`. Keys may have trailing spaces (e.g. `File `, `Cluster    `, `Gender    `). Values may be empty (e.g. `Content` has two tabs).

### Header fields (observed)

| Key | Example value | Description |
|-----|----------------|-------------|
| `GSGT Version` | `2.0.4` | GenomeStudio Genotyping export format version. |
| `Processing Date` | `7/31/2025 12:56 PM` | Date/time of processing (format not standardized). |
| `Content` | (empty then) `AKESOgen_GSAv3_Custom_20032937X364051_A1.bpm` | Bead pool manifest / content identifier. |
| `Num SNPs` | `671521` | Number of SNPs in this file. |
| `Total SNPs` | `671521` | Total SNPs (batch or design). |
| `Num Samples` | `3` | Number of samples in this file (this file may contain one sample’s rows). |
| `Total Samples` | `3` | Total samples in batch. |
| `File ` | `2 of 3` | Part number when split (e.g. “2 of 3”). |
| `Cluster` | `GSAv3_Akesogen_modified_SENT_clusterfile_v3.egt` | Cluster file used for genotype calling. |
| `Gender` | `Female` | Sex/gender for the sample(s) in this file. |

**Notes:**

- Header is **not** guaranteed to have exactly these keys or order in other exports.
- `Num Samples` / `Total Samples` refer to the overall batch; this file’s data rows use a single **Sample ID** (`DSC042739`).

---

## 3. Data section

- **Column header row:** Line 13.  
- **Data rows:** From line 14 to end of file (~205,060 rows in the source file).

### Data columns (fixed order)

| Column index | Column name | Type | Description / constraints |
|--------------|-------------|------|----------------------------|
| 1 | `Sample ID` | string | Sample identifier (e.g. `DSC042739`). In this file, one ID repeated. |
| 2 | `SNP Name` | string | SNP/variant identifier (see SNP Name formats below). |
| 3 | `Chr` | string | Chromosome. Observed: `0`, `1`–`22`, `MT`, `X`, `XY`, `Y`. |
| 4 | `Position` | integer | Reference genome position (1-based). For indels/CNVs, may differ from position embedded in SNP Name. |
| 5 | `Allele1 - Forward` | string | First allele (forward strand). See Allele values. |
| 6 | `Allele2 - Forward` | string | Second allele (forward strand). See Allele values. |

### SNP Name formats (observed)

- **Chr:Position** — e.g. `1:103380393`.
- **Chr:Position_Suffix** — e.g. `1:110228436_CNV_GSTM1`, `1:110230206_CNV_GSTM1_ilmndup1`, `1:161293455_CNV_SDHC_e2_6`, `1:17027762_MNV`, `1:161314422_IlmnF2BTindel`.
- **Chr:Position-RefAlt** — e.g. `1:159174749-C-T`, `1:207754848-GATAA-G` (reference/alternate or variant type).
- **GSA-rsID** — e.g. `GSA-rs67666823` (Illumina GSA / dbSNP rs identifier).

So **SNP Name** is a free-form string; parsing by regex or prefix is required for Chr/Position or rsID.

### Chr (chromosome)

- **Observed values:** `0`, `1`–`22`, `MT`, `X`, `XY`, `Y`.
- `0` and `XY` may indicate QC or non-standard chromosomes; downstream use should define how to treat them.

### Position

- Nonnegative integer; 1-based reference position.
- For some indels/structural variants, **Position** can differ from the position implied by **SNP Name** (e.g. different probe or reference alignment).

### Allele values (Allele1 / Allele2)

- **Standard bases:** `A`, `C`, `G`, `T`.
- **No-call / missing:** `-`.
- **Insertion (I) / Deletion (D):** Used for indels (e.g. `I`, `D` in both columns for some rows).

**Observed single-character values:** `A`, `C`, `D`, `G`, `I`, `T`, `-`.

---

## 4. JSON Schema (data row)

Below is a JSON Schema for a **single data row** (after splitting on tab and matching column names). It does not model the file header.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/schemas/dna-genotype-row.json",
  "title": "DNA Genotype Data Row",
  "description": "One row from the [Data] section of a GSGT genotype export",
  "type": "object",
  "required": ["Sample ID", "SNP Name", "Chr", "Position", "Allele1 - Forward", "Allele2 - Forward"],
  "properties": {
    "Sample ID": {
      "type": "string",
      "description": "Sample identifier"
    },
    "SNP Name": {
      "type": "string",
      "description": "SNP/variant identifier (Chr:Position, Chr:Position_Suffix, Chr:Position-RefAlt, or GSA-rsID)"
    },
    "Chr": {
      "type": "string",
      "description": "Chromosome (0, 1-22, MT, X, XY, Y)"
    },
    "Position": {
      "type": "integer",
      "minimum": 0,
      "description": "Reference genome position (1-based)"
    },
    "Allele1 - Forward": {
      "type": "string",
      "enum": ["A", "C", "D", "G", "I", "T", "-"],
      "description": "First allele on forward strand; - = no-call"
    },
    "Allele2 - Forward": {
      "type": "string",
      "enum": ["A", "C", "D", "G", "I", "T", "-"],
      "description": "Second allele on forward strand; - = no-call"
    }
  }
}
```

---

## 5. Row count and sample scope

- **Data rows in source file:** ~205,061 (one header + ~205,060 data rows).
- **Header “Num SNPs”:** 671,521 — likely total SNPs on the array or in the full batch; this file is “File 2 of 3”, so SNPs may be split across files or this file may contain only one sample’s calls for a subset of SNPs.
- **Sample ID in this file:** Only `DSC042739` appears in the data rows.

---

## 6. Ambiguities and recommendations

| Issue | Suggestion |
|-------|------------|
| **Header “Num Samples” = 3** but only one **Sample ID** in this file | Treat “Num Samples” as batch metadata; infer sample set from distinct **Sample ID** in the data (here: one sample). If other files (1 of 3, 3 of 3) exist, combine or validate across them. |
| **SNP Name** format varies | Do not assume a single pattern. Support Chr:Position, Chr:Position_Suffix, Chr:Position-RefAlt, and GSA-rsID; optionally normalize to Chr, Position, and optional rsID. |
| **Chr** values `0` and `XY` | Define whether to exclude, map, or keep as-is for QC/interpretation. |
| **Position** vs position in **SNP Name** | Prefer **Chr** + **Position** for genomic coordinates; use **SNP Name** for display and lookup. For indels, keep both. |
| **Allele** `I` / `D` | Treat as insertion/deletion indicators; sequence or length may be in **SNP Name** (e.g. `GATAA-G`) or require external manifest. |
| **Reference genome** | Not stated in the file. Assume GRCh37/hg19 or confirm with assay provider (GSAv3 is often hg19). |
| **Strand** | Column names say “Forward”; if converting to reference or reverse strand, use assay manifest or known convention. |

---

## 7. Summary

- **Format:** GSGT tab-delimited: `[Header]` block then `[Data]` with one header row and one row per SNP per sample.
- **Header:** Free-form key-value pairs; at least GSGT Version, Processing Date, Content, Num/Total SNPs, Num/Total Samples, File, Cluster, Gender.
- **Data:** Six columns — Sample ID, SNP Name, Chr, Position, Allele1 - Forward, Allele2 - Forward.
- **SNP Name:** Multiple formats (Chr:Position, suffixes, RefAlt, GSA-rsID).
- **Alleles:** A, C, G, T, -, I, D.
- **Chr:** 0, 1–22, MT, X, XY, Y.

If you need a schema for a different target (e.g. database DDL, TypeScript types, or Parquet), say the target and we can derive it from this.
