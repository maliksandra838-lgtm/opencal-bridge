# Quick start

## 1. Use synthetic data first

Run the app locally with `npm install` and `npm run dev`, or open a published
static build. Select **Load synthetic sample**. The three status cards should
show:

1. Input checks — Passed
2. Metrology semantics — Passed (or explicit warnings)
3. PTB DCC 3.3.0 XSD — Passed

Download the XML and audit HTML. The report is self-contained and can be opened
without OpenCal Bridge.

## 2. Prepare your own copy

Copy `examples/mass/synthetic-mass.csv` or `.xlsx`. Keep the v0.1 header names
unchanged. Repeat certificate-level metadata on every result row and replace all
synthetic values.

Important rules:

- `country_code`: two uppercase letters, such as `CN`, `DE`, or `US`;
- `language`: `en` or `zh`;
- `calibration_date`: `YYYY-MM-DD`;
- decimal separator: a dot;
- `error = indication - reference_value` under the v0.1 sign convention;
- `expanded_uncertainty >= 0` and `coverage_factor > 0`;
- files: at most 10 MiB and 10,000 XLSX data rows.

## 3. Review every layer

Warnings do not automatically block XML generation, but they require technical
review. XML download is enabled only when blocking checks pass and the actual
DCC XSD validator returns valid.

The generated XML is unsigned. The audit report is not a calibration
certificate. Preserve your original source file and use your laboratory's
document-control process for any evaluated output.
