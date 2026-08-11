import type { CalibrationPoint, CalibrationRecord } from "./types";

const DSI_UNIT: Record<string, string> = {
  kg: "\\kilogram",
  g: "\\gram",
  mg: "\\milligram",
  Cel: "\\degreecelsius",
  K: "\\kelvin",
  Pa: "\\pascal",
  kPa: "\\kilopascal",
  MPa: "\\megapascal",
  N: "\\newton",
  m: "\\metre",
  mm: "\\millimetre",
  um: "\\micrometre",
  V: "\\volt",
  A: "\\ampere",
  Hz: "\\hertz",
  s: "\\second",
};

export const escapeXml = (value: string): string => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

const text = (value: string, lang?: string): string =>
  `<dcc:name><dcc:content${lang ? ` lang="${lang}"` : ""}>${escapeXml(value)}</dcc:content></dcc:name>`;

const quantity = (name: string, value: number, unit: string, uncertainty?: Pick<CalibrationPoint, "expandedUncertainty" | "coverageFactor">): string => {
  const uncertaintyXml = uncertainty
    ? `<si:measurementUncertaintyUnivariate><si:expandedMU><si:valueExpandedMU>${uncertainty.expandedUncertainty}</si:valueExpandedMU><si:coverageFactor>${uncertainty.coverageFactor}</si:coverageFactor><si:coverageProbability>0.95</si:coverageProbability><si:distribution>normal</si:distribution></si:expandedMU></si:measurementUncertaintyUnivariate>`
    : "";
  return `<dcc:quantity>${text(name, "en")}<si:real><si:value>${value}</si:value><si:unit>${escapeXml(DSI_UNIT[unit] ?? unit)}</si:unit>${uncertaintyXml}</si:real></dcc:quantity>`;
};

function result(point: CalibrationPoint): string {
  return `<dcc:result id="result-${point.row - 1}">${text(point.resultName)}<dcc:data><dcc:list>${text(`Source row ${point.row}`, "en")}${quantity("Reference value", point.referenceValue, point.unit)}${quantity("Indication", point.indication, point.unit)}${quantity("Error", point.error, point.unit, point)}</dcc:list></dcc:data></dcc:result>`;
}

export function generateDccXml(record: CalibrationRecord): string {
  const lang = record.language;
  return `<?xml version="1.0" encoding="UTF-8"?>
<dcc:digitalCalibrationCertificate xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:dcc="https://ptb.de/dcc" xmlns:si="https://ptb.de/si" xsi:schemaLocation="https://ptb.de/dcc https://ptb.de/dcc/v3.3.0/dcc.xsd" schemaVersion="3.3.0">
  <dcc:administrativeData>
    <dcc:dccSoftware><dcc:software>${text("OpenCal Bridge")}<dcc:release>0.1.0-alpha.1</dcc:release><dcc:type>application</dcc:type></dcc:software></dcc:dccSoftware>
    <dcc:coreData>
      <dcc:countryCodeISO3166_1>${escapeXml(record.countryCode)}</dcc:countryCodeISO3166_1>
      <dcc:usedLangCodeISO639_1>${lang}</dcc:usedLangCodeISO639_1>
      <dcc:mandatoryLangCodeISO639_1>${lang}</dcc:mandatoryLangCodeISO639_1>
      <dcc:uniqueIdentifier>${escapeXml(record.certificateId)}</dcc:uniqueIdentifier>
      <dcc:beginPerformanceDate>${record.calibrationDate}</dcc:beginPerformanceDate>
      <dcc:endPerformanceDate>${record.calibrationDate}</dcc:endPerformanceDate>
      <dcc:performanceLocation>laboratory</dcc:performanceLocation>
    </dcc:coreData>
    <dcc:items><dcc:item>${text(record.itemName, lang)}<dcc:identifications><dcc:identification><dcc:issuer>manufacturer</dcc:issuer><dcc:value>${escapeXml(record.itemSerial)}</dcc:value>${text("Serial number", "en")}</dcc:identification></dcc:identifications></dcc:item></dcc:items>
    <dcc:calibrationLaboratory><dcc:contact>${text(record.laboratoryName)}<dcc:location><dcc:countryCode>${escapeXml(record.countryCode)}</dcc:countryCode></dcc:location></dcc:contact></dcc:calibrationLaboratory>
    <dcc:respPersons><dcc:respPerson><dcc:person>${text(record.responsiblePerson)}</dcc:person><dcc:mainSigner>true</dcc:mainSigner></dcc:respPerson></dcc:respPersons>
    <dcc:customer>${text(record.customerName)}<dcc:location><dcc:countryCode>${escapeXml(record.countryCode)}</dcc:countryCode></dcc:location></dcc:customer>
  </dcc:administrativeData>
  <dcc:measurementResults>
    <dcc:measurementResult id="measurement-result-1">
      ${text("Measurement results", "en")}
      <dcc:usedMethods><dcc:usedMethod>${text(record.method)}</dcc:usedMethod></dcc:usedMethods>
      <dcc:results>${record.points.map(result).join("")}</dcc:results>
    </dcc:measurementResult>
  </dcc:measurementResults>
</dcc:digitalCalibrationCertificate>`;
}
