import { validateXML } from "xmllint-wasm";
import dccSchema from "../vendor/schemas/dcc.xsd?raw";
import dsiSchema from "../vendor/schemas/SI_Format.xsd?raw";
import qudtSchema from "../vendor/schemas/quantitykind.xsd?raw";
import xmlDsigSchema from "../vendor/schemas/xmldsig-core-schema.xsd?raw";

export interface XsdResult {
  valid: boolean;
  errors: string[];
}

export async function validateDccXml(xml: string): Promise<XsdResult> {
  const result = await validateXML({
    xml: [{ fileName: "generated-dcc.xml", contents: xml }],
    schema: [dccSchema],
    preload: [
      { fileName: "https://ptb.de/si/v2.2.1/SI_Format.xsd", contents: dsiSchema },
      { fileName: "https://www.ptb.de/si/v2.2.1/qudt/quantitykind.xsd", contents: qudtSchema },
      { fileName: "https://www.ptb.de/dcc/d-sig/xmldsig-core-schema.xsd", contents: xmlDsigSchema },
    ],
    initialMemoryPages: 512,
    maxMemoryPages: 2048,
  });
  return { valid: result.valid, errors: result.errors.map((error) => error.rawMessage) };
}
