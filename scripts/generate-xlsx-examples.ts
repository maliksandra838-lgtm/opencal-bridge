import ExcelJS from "exceljs";
import JSZip from "jszip";
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseCsv } from "../src/core/parser";
import { REQUIRED_COLUMNS } from "../src/core/types";

const root = resolve(import.meta.dirname, "..");
for (const domain of ["mass", "temperature"] as const) {
  const rows = parseCsv(readFileSync(resolve(root, `examples/${domain}/synthetic-${domain}.csv`), "utf8"));
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "OpenCal Bridge synthetic fixture generator";
  workbook.created = new Date("2026-08-01T00:00:00Z");
  workbook.modified = new Date("2026-08-01T00:00:00Z");
  const sheet = workbook.addWorksheet("calibration_data");
  sheet.columns = REQUIRED_COLUMNS.map((header) => ({ header, key: header, width: Math.max(14, header.length + 2) }));
  for (const row of rows) sheet.addRow(row);
  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  const output = resolve(root, `examples/${domain}/synthetic-${domain}.xlsx`);
  const raw = await workbook.xlsx.writeBuffer();
  const archive = await JSZip.loadAsync(raw);
  const fixedZipDate = new Date("2026-08-01T00:00:00Z");
  Object.values(archive.files).forEach((entry) => { entry.date = fixedZipDate; });
  const normalized = await archive.generateAsync({ type: "nodebuffer", compression: "DEFLATE", compressionOptions: { level: 6 }, platform: "UNIX" });
  writeFileSync(output, normalized);
  copyFileSync(output, resolve(root, `public/examples/${domain}/synthetic-${domain}.xlsx`));
  console.log(`Generated synthetic-${domain}.xlsx`);
}
