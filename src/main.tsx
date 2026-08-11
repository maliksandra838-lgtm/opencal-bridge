import { StrictMode, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { generateDccXml } from "./core/dcc";
import { t } from "./core/i18n";
import { buildRecord, parseCalibrationFile, parseCsv } from "./core/parser";
import { generateAuditReport } from "./core/report";
import type { Diagnostic, Locale, PipelineResult } from "./core/types";
import { validateDccXml, type XsdResult } from "./core/validator";
import "./style.css";

function download(name: string, contents: string, type: string): void {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function StatusCard({ title, status, detail }: { title: string; status: "idle" | "pass" | "warn" | "fail" | "running"; detail: string }) {
  return <section className={`status ${status}`}><span>{title}</span><strong>{status === "running" ? "…" : detail}</strong></section>;
}

function App() {
  const [locale, setLocale] = useState<Locale>("en");
  const [pipeline, setPipeline] = useState<PipelineResult>({ diagnostics: [] });
  const [xml, setXml] = useState("");
  const [xsd, setXsd] = useState<XsdResult | undefined>();
  const [busy, setBusy] = useState(false);
  const diagnostics = pipeline.diagnostics;
  const inputErrors = diagnostics.filter((item) => item.stage === "input" && item.severity === "error");
  const semanticErrors = diagnostics.filter((item) => item.stage === "semantic" && item.severity === "error");
  const warnings = diagnostics.filter((item) => item.severity === "warning");
  const visibleDiagnostics = diagnostics.filter((item) => item.severity !== "info");

  async function complete(result: PipelineResult): Promise<void> {
    setPipeline(result);
    setXsd(undefined);
    if (!result.record) { setXml(""); return; }
    const generated = generateDccXml(result.record);
    setXml(generated);
    setBusy(true);
    try {
      setXsd(await validateDccXml(generated));
    } catch (error) {
      setXsd({ valid: false, errors: [`Validator failed: ${error instanceof Error ? error.message : String(error)}`] });
    } finally {
      setBusy(false);
    }
  }

  async function handleFile(file?: File): Promise<void> {
    if (!file) return;
    setBusy(true);
    const result = await parseCalibrationFile(file);
    await complete(result);
  }

  async function loadSample(): Promise<void> {
    setBusy(true);
    try {
      const response = await fetch("./examples/mass/synthetic-mass.csv");
      await complete(buildRecord(parseCsv(await response.text()), "synthetic-mass.csv"));
    } catch (error) {
      setPipeline({ diagnostics: [{ code: "OCB-IMP-005", severity: "error", stage: "input", message: String(error), blocking: true }] });
      setBusy(false);
    }
  }

  const inputStatus = !pipeline.record && diagnostics.length === 0 ? "idle" : inputErrors.length ? "fail" : "pass";
  const semanticStatus = !pipeline.record ? "idle" : semanticErrors.length ? "fail" : warnings.length ? "warn" : "pass";
  const xsdStatus = busy && xml ? "running" : !xsd ? "idle" : xsd.valid ? "pass" : "fail";
  const report = useMemo(() => pipeline.record && xsd ? generateAuditReport(pipeline.record, diagnostics, xsd.valid, locale) : "", [pipeline.record, diagnostics, xsd, locale]);

  return <main>
    <header>
      <div><div className="eyebrow">DCC 3.3.0 · LOCAL-FIRST · OPEN SOURCE</div><h1>{t(locale, "title")}</h1><p>{t(locale, "subtitle")}</p></div>
      <button className="lang" onClick={() => setLocale(locale === "en" ? "zh-CN" : "en")}>{locale === "en" ? "中文" : "English"}</button>
    </header>
    <section className="privacy"><span aria-hidden="true">●</span>{t(locale, "privacy")}</section>
    <section className="actions">
      <label className="primary">{t(locale, "choose")}<input type="file" accept=".csv,.xlsx" onChange={(event) => void handleFile(event.target.files?.[0])} /></label>
      <button onClick={() => void loadSample()} disabled={busy}>{t(locale, "sample")}</button>
    </section>
    <section className="statusGrid">
      <StatusCard title={t(locale, "input")} status={inputStatus} detail={inputStatus === "pass" ? t(locale, "passed") : inputStatus === "fail" ? t(locale, "failed") : t(locale, "notRun")} />
      <StatusCard title={t(locale, "semantic")} status={semanticStatus} detail={semanticStatus === "pass" ? t(locale, "passed") : semanticStatus === "warn" ? `${warnings.length} ${t(locale, "warnings")}` : semanticStatus === "fail" ? t(locale, "failed") : t(locale, "notRun")} />
      <StatusCard title={t(locale, "xsd")} status={xsdStatus} detail={!xsd ? t(locale, "notRun") : xsd.valid ? t(locale, "passed") : t(locale, "failed")} />
    </section>
    <p className="schemaNote">{t(locale, "schemaNote")}</p>
    {!pipeline.record && diagnostics.length === 0 && <section className="empty">{t(locale, "empty")}</section>}
    {pipeline.record && <>
      <section className="summary"><div><small>{t(locale, "certificate")}</small><strong>{pipeline.record.certificateId}</strong></div><div><small>{t(locale, "item")}</small><strong>{pipeline.record.itemName}</strong></div><div><small>{t(locale, "rows")}</small><strong>{pipeline.record.points.length}</strong></div></section>
      <section className="panel"><h2>{t(locale, "preview")}</h2><div className="tableWrap"><table><thead><tr><th>#</th><th>{t(locale, "reference")}</th><th>{t(locale, "indication")}</th><th>{t(locale, "error")}</th><th>{t(locale, "uncertainty")}</th></tr></thead><tbody>{pipeline.record.points.map((point) => <tr key={point.row}><td>{point.row}</td><td>{point.referenceValue} {point.unit}</td><td>{point.indication} {point.unit}</td><td>{point.error} {point.unit}</td><td>{point.expandedUncertainty} {point.unit} (k={point.coverageFactor})</td></tr>)}</tbody></table></div></section>
      <section className="exports"><button className="primary" disabled={!xsd?.valid} onClick={() => download(`${pipeline.record!.certificateId}.xml`, xml, "application/xml")}>{t(locale, "exportXml")}</button><button disabled={!report} onClick={() => download(`${pipeline.record!.certificateId}-audit.html`, report, "text/html")}>{t(locale, "exportReport")}</button></section>
    </>}
    {(visibleDiagnostics.length > 0 || (xsd && !xsd.valid)) && <section className="panel diagnostics"><h2>{t(locale, "diagnostics")}</h2>{visibleDiagnostics.map((item: Diagnostic) => <div className={item.severity} key={`${item.code}-${item.source?.row ?? 0}`}><code>{item.code}</code><span>{item.message}</span><small>{item.source?.row ? `row ${item.source.row}` : ""}</small></div>)}{xsd?.errors.map((message, index) => <div className="error" key={index}><code>OCB-XSD-001</code><span>{message}</span></div>)}</section>}
    <footer>OpenCal Bridge v0.1.0-alpha.1 · Not affiliated with or endorsed by PTB, BIPM, or DKD.</footer>
  </main>;
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
