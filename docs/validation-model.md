# Validation model

OpenCal Bridge deliberately avoids a single green “compliant” badge.

## Input layer

Stable `OCB-IMP-*` and `OCB-STR-*` diagnostics check file support, fixed headers,
required values, cross-row metadata consistency, language/country formats, and
date parsing. Blocking errors prevent record construction.

## Metrology-semantics layer

`OCB-MET-*`, `OCB-UNI-*`, and `OCB-UNC-*` diagnostics check finite numeric
values, the v0.1 error sign convention, tested unit mapping, non-negative
expanded uncertainty, and a positive coverage factor. A warning signals a
review need; it is not an automatic conformity result.

## XSD layer

The generated XML is validated in-browser with `xmllint-wasm`/libxml2 against:

- PTB DCC 3.3.0;
- PTB D-SI 2.2.1;
- the D-SI QUDT quantitykind dependency;
- the PTB-hosted no-DTD XMLDSig dependency.

All imports are preloaded from the application bundle. The validator performs no
schema network request. Release fixtures are cross-validated with a separate
native `xmllint` execution using an XML catalog and `--nonet`.

## Explicit non-claims

XSD validity does not prove correct measurements, traceability, uncertainty
evaluation, method compliance, accreditation, digital signature validity,
ISO/IEC 17025 conformity, or authorization to issue. Those questions require a
competent laboratory's controlled review and evidence beyond this software.
