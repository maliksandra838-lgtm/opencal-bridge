export type Locale = "en" | "zh-CN";
export type Severity = "error" | "warning" | "info";

export interface SourceLocation {
  file: string;
  row?: number;
  column?: string;
}

export interface Diagnostic {
  code: string;
  severity: Severity;
  stage: "input" | "semantic" | "dcc" | "xsd";
  message: string;
  source?: SourceLocation;
  blocking: boolean;
}

export interface CalibrationPoint {
  row: number;
  resultName: string;
  referenceValue: number;
  indication: number;
  error: number;
  unit: string;
  expandedUncertainty: number;
  coverageFactor: number;
}

export interface CalibrationRecord {
  sourceFile: string;
  certificateId: string;
  countryCode: string;
  language: "en" | "zh";
  calibrationDate: string;
  laboratoryName: string;
  customerName: string;
  responsiblePerson: string;
  itemName: string;
  itemSerial: string;
  method: string;
  points: CalibrationPoint[];
}

export interface PipelineResult {
  record?: CalibrationRecord;
  diagnostics: Diagnostic[];
}

export const REQUIRED_COLUMNS = [
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
  "result_name",
  "reference_value",
  "indication",
  "error",
  "unit",
  "expanded_uncertainty",
  "coverage_factor",
] as const;

export type RequiredColumn = (typeof REQUIRED_COLUMNS)[number];
export type InputRow = Record<RequiredColumn, string>;
