# Security policy

## Supported versions

Security fixes are applied to the latest release and `main` during the alpha.

## Report privately

Do not open a public Issue for a vulnerability or attach sensitive calibration
data. Use GitHub's **Report a vulnerability** private advisory flow for this
repository. If that feature is temporarily unavailable, open a content-free
Issue asking the maintainer to enable a private channel.

Include the affected version, impact, minimal synthetic reproduction, and any
suggested mitigation. Remove customer, laboratory, staff, certificate, device,
path, and credential information.

## Threat model highlights

- malicious CSV/XLSX content and oversized ZIP structures;
- formula cells, external workbook links, macros, and hidden sheets;
- XML injection and external entity/schema resolution;
- dependency or release artifact compromise;
- false confidence created by conflating XSD validity with metrological
  conformity.

The alpha limits files to 10 MiB and XLSX data to 10,000 rows, escapes generated
XML/HTML text, does not execute formulas/macros, and preloads schemas locally.
Security review is ongoing; do not treat the alpha as a certified secure
processing system.
