import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { validateXML } from "xmllint-wasm";

const root = resolve(import.meta.dirname, "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");
const schema = read("public/schemas/ptb/dcc/3.3.0/dcc.xsd");
const preload = [
  { fileName: "https://ptb.de/si/v2.2.1/SI_Format.xsd", contents: read("public/schemas/ptb/d-si/2.2.1/SI_Format.xsd") },
  { fileName: "https://www.ptb.de/si/v2.2.1/qudt/quantitykind.xsd", contents: read("public/schemas/ptb/d-si/2.2.1/qudt/quantitykind.xsd") },
  { fileName: "https://www.ptb.de/dcc/d-sig/xmldsig-core-schema.xsd", contents: read("public/schemas/ptb/xmldsig/xmldsig-core-schema.xsd") },
];

const fixtures = ["tests/fixtures/generated-mass.xml", "tests/fixtures/generated-temperature.xml"];
for (const fixture of fixtures) {
  const xml = read(fixture);
  const wasm = await validateXML({ xml: [{ fileName: fixture, contents: xml }], schema: [schema], preload });
  if (!wasm.valid) {
    console.error(wasm.rawOutput);
    process.exitCode = 1;
    continue;
  }
  execFileSync("xmllint", ["--noout", "--nonet", "--schema", resolve(root, "public/schemas/ptb/dcc/3.3.0/dcc.xsd"), resolve(root, fixture)], {
    env: { ...process.env, XML_CATALOG_FILES: resolve(root, "scripts/xml-catalog.xml") },
    stdio: "inherit",
  });
  console.log(`VALID (WASM + native): ${fixture}`);
}
