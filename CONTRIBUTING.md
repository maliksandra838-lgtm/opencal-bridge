# Contributing

Thank you for improving DCC interoperability.

## Before opening an Issue

1. Search existing Issues and the stable diagnostic code.
2. Reproduce with the latest release or `main`.
3. Replace all business data with a minimal synthetic fixture.
4. State browser/OS, OpenCal Bridge version, source format, expected result, and
   actual diagnostic or XSD output.

Never upload real customer names, laboratory staff, certificate identifiers,
equipment serials, results, signatures, addresses, emails, tokens, local paths,
or licensed standards text.

## Pull requests

```bash
npm install
npm run check
```

PRs should:

- solve one problem and link an Issue when practical;
- include a positive or negative synthetic test;
- preserve deterministic output and stable diagnostic codes;
- update English and Chinese user-facing text together;
- avoid new network calls, telemetry, or hidden persistence;
- preserve third-party notices and avoid copying standards or closed data;
- describe validation limits without using “compliant” as shorthand for XSD
  validity.

Schema, unit, uncertainty, or sign-convention changes require a source link and
maintainer review. Generated files should be reproducible from checked-in
scripts.

By participating, you agree to follow [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
