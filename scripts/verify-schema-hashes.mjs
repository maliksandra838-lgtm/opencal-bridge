import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { basename, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const manifest = JSON.parse(readFileSync(resolve(root, "public/schemas/schema-manifest.json"), "utf8"));
const vendorName = {
  "dcc.xsd": "dcc.xsd",
  "SI_Format.xsd": "SI_Format.xsd",
  "quantitykind.xsd": "quantitykind.xsd",
  "xmldsig-core-schema.xsd": "xmldsig-core-schema.xsd",
};
const sha256 = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");

for (const entry of manifest.schemas) {
  const publicFile = resolve(root, "public/schemas", entry.file);
  const actual = sha256(publicFile);
  if (actual !== entry.sha256) throw new Error(`Checksum mismatch: ${entry.file}`);
  const vendorFile = resolve(root, "src/vendor/schemas", vendorName[basename(entry.file)]);
  if (sha256(vendorFile) !== actual) throw new Error(`Vendor copy differs: ${entry.file}`);
  console.log(`VERIFIED ${entry.sha256.slice(0, 12)}… ${entry.file}`);
}
