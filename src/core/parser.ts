import Papa from "papaparse";
import {
  REQUIRED_COLUMNS,
  type CalibrationPoint,
  type CalibrationRecord,
  type Diagnostic,
  type InputRow,
  type PipelineResult,
  type RequiredColumn,
} from "./types";

const numericColumns = [
  "reference_value",
  "indication",
  "error",
  "expanded_uncertainty",
  "coverage_factor",
] as const;

const metadataColumns = [
  "certificate_id",
  "country_code",
  "language",
  "calibration_date",
  "laboratory_name",
  "customer_name",
  "responsible_person",
  "item_name",
  "item_serial",
  "method",
] as const;

const supportedUnits = new Set([
  "kg", "g", "mg", "Cel", "K", "Pa", "kPa", "MPa", "N", "m", "mm", "um", "V", "A", "Hz", "s",
]);

function diagnostic(
  code: string,
  severity: Diagnostic["severity"],
  stage: Diagnostic["stage"],
  message: string,
  file: string,
  row?: number,
  column?: string,
): Diagnostic {
  return {
    code,
    severity,
    stage,
    message,
    source: { file, row, column },
    blocking: severity === "error",
  };
}

function normalizeRows(rows: Record<string, unknown>[]): Record<string, string>[] {
  return rows.map((row) =>
    Object.fromEntries(Object.entries(row).map(([key, value]) => [key.trim(), String(value ?? "").trim()])),
  );
}

export function parseCsv(text: string): Record<string, string>[] {
  const parsed = Papa.parse<Record<string, unknown>>(text.replace(/^\uFEFF/, ""), {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header) => header.trim(),
  });
  return normalizeRows(parsed.data);
}

export async function parseXlsx(buffer: ArrayBuffer): Promise<{ rows: Record<string, string>[]; warnings: string[] }> {
  const { default: ExcelJS } = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) return { rows: [], warnings: ["Workbook has no worksheet."] };

  const headers: string[] = [];
  worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell, column) => {
    headers[column - 1] = cell.text.trim();
  });

  const rows: Record<string, string>[] = [];
  const warnings: string[] = [];
  if (workbook.worksheets.length > 20) warnings.push("Workbook contains more than 20 worksheets; only the first worksheet was read.");
  if (worksheet.rowCount > 10_001) throw new Error("Worksheet exceeds the 10,000 data-row safety limit.");
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    const output: Record<string, string> = {};
    headers.forEach((header, index) => {
      if (!header) return;
      const cell = row.getCell(index + 1);
      const raw = cell.value;
      if (typeof raw === "object" && raw && "formula" in raw) {
        warnings.push(`Formula value read from row ${rowNumber}, column ${header}; formula was not executed.`);
      }
      output[header] = cell.text.trim();
    });
    if (Object.values(output).some(Boolean)) rows.push(output);
  });
  return { rows, warnings };
}

export function buildRecord(rows: Record<string, string>[], sourceFile: string): PipelineResult {
  const diagnostics: Diagnostic[] = [];
  if (rows.length === 0) {
    diagnostics.push(diagnostic("OCB-IMP-001", "error", "input", "No data rows found.", sourceFile));
    return { diagnostics };
  }

  const available = new Set(Object.keys(rows[0] ?? {}));
  for (const column of REQUIRED_COLUMNS) {
    if (!available.has(column)) {
      diagnostics.push(diagnostic("OCB-IMP-002", "error", "input", `Required column is missing: ${column}`, sourceFile, 1, column));
    }
  }
  if (diagnostics.some((item) => item.blocking)) return { diagnostics };

  const typedRows = rows as InputRow[];
  const first = typedRows[0]!;
  for (const column of metadataColumns) {
    if (!first[column]) {
      diagnostics.push(diagnostic("OCB-STR-001", "error", "input", `Required value is empty: ${column}`, sourceFile, 2, column));
    }
    typedRows.forEach((row, index) => {
      if (row[column] !== first[column]) {
        diagnostics.push(diagnostic("OCB-STR-002", "error", "input", `Metadata differs from the first row: ${column}`, sourceFile, index + 2, column));
      }
    });
  }

  if (!/^[A-Z]{2}$/.test(first.country_code)) {
    diagnostics.push(diagnostic("OCB-STR-003", "error", "input", "country_code must be two uppercase letters.", sourceFile, 2, "country_code"));
  }
  if (first.language !== "en" && first.language !== "zh") {
    diagnostics.push(diagnostic("OCB-STR-004", "error", "input", "language must be en or zh.", sourceFile, 2, "language"));
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(first.calibration_date) || Number.isNaN(Date.parse(`${first.calibration_date}T00:00:00Z`))) {
    diagnostics.push(diagnostic("OCB-STR-005", "error", "input", "calibration_date must be a valid YYYY-MM-DD date.", sourceFile, 2, "calibration_date"));
  }

  const points: CalibrationPoint[] = [];
  typedRows.forEach((row, index) => {
    const sourceRow = index + 2;
    for (const column of [...numericColumns, "result_name", "unit"] as const) {
      if (!row[column]) {
        diagnostics.push(diagnostic("OCB-STR-006", "error", "input", `Required value is empty: ${column}`, sourceFile, sourceRow, column));
      }
    }
    const values = Object.fromEntries(numericColumns.map((column) => [column, Number(row[column])])) as Record<(typeof numericColumns)[number], number>;
    for (const column of numericColumns) {
      if (!Number.isFinite(values[column])) {
        diagnostics.push(diagnostic("OCB-MET-001", "error", "semantic", `${column} must be a finite number.`, sourceFile, sourceRow, column));
      }
    }
    if (Number.isFinite(values.expanded_uncertainty) && values.expanded_uncertainty < 0) {
      diagnostics.push(diagnostic("OCB-UNC-001", "error", "semantic", "Expanded uncertainty must be non-negative.", sourceFile, sourceRow, "expanded_uncertainty"));
    }
    if (Number.isFinite(values.coverage_factor) && values.coverage_factor <= 0) {
      diagnostics.push(diagnostic("OCB-UNC-002", "error", "semantic", "Coverage factor must be greater than zero.", sourceFile, sourceRow, "coverage_factor"));
    }
    if (Number.isFinite(values.error) && Number.isFinite(values.indication) && Number.isFinite(values.reference_value)) {
      const calculated = values.indication - values.reference_value;
      const tolerance = Math.max(1e-12, Math.abs(values.error) * 1e-9);
      if (Math.abs(calculated - values.error) > tolerance) {
        diagnostics.push(diagnostic("OCB-MET-007", "warning", "semantic", `Reported error ${values.error} differs from indication − reference (${calculated}).`, sourceFile, sourceRow, "error"));
      }
    }
    if (!supportedUnits.has(row.unit)) {
      diagnostics.push(diagnostic("OCB-UNI-001", "warning", "semantic", `Unit '${row.unit}' is not yet in the tested D-SI mapping.`, sourceFile, sourceRow, "unit"));
    }
    if (!diagnostics.some((item) => item.blocking && item.source?.row === sourceRow)) {
      points.push({
        row: sourceRow,
        resultName: row.result_name,
        referenceValue: values.reference_value,
        indication: values.indication,
        error: values.error,
        unit: row.unit,
        expandedUncertainty: values.expanded_uncertainty,
        coverageFactor: values.coverage_factor,
      });
    }
  });

  if (diagnostics.some((item) => item.blocking)) return { diagnostics };
  const record: CalibrationRecord = {
    sourceFile,
    certificateId: first.certificate_id,
    countryCode: first.country_code,
    language: first.language as "en" | "zh",
    calibrationDate: first.calibration_date,
    laboratoryName: first.laboratory_name,
    customerName: first.customer_name,
    responsiblePerson: first.responsible_person,
    itemName: first.item_name,
    itemSerial: first.item_serial,
    method: first.method,
    points,
  };
  diagnostics.push(diagnostic("OCB-STR-000", "info", "input", `${points.length} measurement row(s) parsed.`, sourceFile));
  return { record, diagnostics };
}

export async function parseCalibrationFile(file: File): Promise<PipelineResult> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  try {
    if (file.size > 10 * 1024 * 1024) {
      return { diagnostics: [diagnostic("OCB-IMP-006", "error", "input", "File exceeds the 10 MiB safety limit.", file.name)] };
    }
    if (extension === "csv") return buildRecord(parseCsv(await file.text()), file.name);
    if (extension === "xlsx") {
      const parsed = await parseXlsx(await file.arrayBuffer());
      const result = buildRecord(parsed.rows, file.name);
      result.diagnostics.push(...parsed.warnings.map((message) => diagnostic("OCB-IMP-010", "warning", "input", message, file.name)));
      return result;
    }
    return { diagnostics: [diagnostic("OCB-IMP-003", "error", "input", "Only .csv and .xlsx files are supported.", file.name)] };
  } catch (error) {
    return { diagnostics: [diagnostic("OCB-IMP-004", "error", "input", `Could not parse file: ${error instanceof Error ? error.message : String(error)}`, file.name)] };
  }
}
