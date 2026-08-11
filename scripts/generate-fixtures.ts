import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { generateDccXml } from "../src/core/dcc";
import { buildRecord, parseCsv } from "../src/core/parser";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "tests/fixtures");
mkdirSync(output, { recursive: true });

for (const [domain, filename] of [["mass", "generated-mass.xml"], ["temperature", "generated-temperature.xml"]] as const) {
  const source = resolve(root, `examples/${domain}/synthetic-${domain}.csv`);
  const result = buildRecord(parseCsv(readFileSync(source, "utf8")), `synthetic-${domain}.csv`);
  if (!result.record) throw new Error(`Could not build ${domain} fixture: ${JSON.stringify(result.diagnostics)}`);
  writeFileSync(resolve(output, filename), generateDccXml(result.record));
  console.log(`Generated ${filename}`);
}
