import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { generateDccXml } from "../core/dcc";
import { buildRecord, parseCsv } from "../core/parser";

const sample = readFileSync(resolve(process.cwd(), "examples/mass/synthetic-mass.csv"), "utf8");

describe("OpenCal Bridge core", () => {
  it("parses the synthetic mass example", () => {
    const result = buildRecord(parseCsv(sample), "synthetic-mass.csv");
    expect(result.record?.points).toHaveLength(3);
    expect(result.diagnostics.some((item) => item.severity === "error")).toBe(false);
  });

  it("generates deterministic DCC XML", () => {
    const result = buildRecord(parseCsv(sample), "synthetic-mass.csv");
    expect(result.record).toBeDefined();
    const first = generateDccXml(result.record!);
    const second = generateDccXml(result.record!);
    expect(first).toBe(second);
    expect(first).toContain('schemaVersion="3.3.0"');
    expect(first).toContain("SYNTHETIC-MASS-2026-001");
  });

  it("blocks a missing required column", () => {
    const rows = parseCsv(sample).map(({ coverage_factor: _removed, ...row }) => row);
    const result = buildRecord(rows, "broken.csv");
    expect(result.record).toBeUndefined();
    expect(result.diagnostics).toContainEqual(expect.objectContaining({ code: "OCB-IMP-002", severity: "error" }));
  });

  it("blocks negative uncertainty", () => {
    const rows = parseCsv(sample);
    rows[0]!.expanded_uncertainty = "-1";
    const result = buildRecord(rows, "broken.csv");
    expect(result.record).toBeUndefined();
    expect(result.diagnostics).toContainEqual(expect.objectContaining({ code: "OCB-UNC-001", severity: "error" }));
  });

  it("warns when error does not equal indication minus reference", () => {
    const rows = parseCsv(sample);
    rows[0]!.error = "42";
    const result = buildRecord(rows, "warning.csv");
    expect(result.record).toBeDefined();
    expect(result.diagnostics).toContainEqual(expect.objectContaining({ code: "OCB-MET-007", severity: "warning" }));
  });

  it("escapes imported text in XML", () => {
    const rows = parseCsv(sample);
    rows.forEach((row) => { row.customer_name = "A & B <Lab>"; });
    const result = buildRecord(rows, "escape.csv");
    const xml = generateDccXml(result.record!);
    expect(xml).toContain("A &amp; B &lt;Lab&gt;");
    expect(xml).not.toContain("A & B <Lab>");
  });
});
