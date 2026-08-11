# Third-party notices

OpenCal Bridge's own source code is licensed under the MIT License. Runtime and
development packages are governed by their respective licenses in
`package-lock.json`.

## PTB DCC and D-SI schemas

- DCC XML Schema 3.3.0
- D-SI XML Schema 2.2.1 and its `quantitykind.xsd` dependency
- Copyright: Physikalisch-Technische Bundesanstalt (PTB) and contributors
- License: GNU Lesser General Public License v3.0 only
- Upstream sources and SHA-256 checksums: `public/schemas/schema-manifest.json`
- License text: `public/schemas/licenses/PTB_DCC_LGPL-3.0.txt`

The files are redistributed unmodified. Build-time copies under
`src/vendor/schemas/` are byte-identical to the public copies.

## XMLDSig schema

The bundled `xmldsig-core-schema.xsd` is the PTB-hosted no-DTD copy of the W3C
XML Signature schema. Its embedded W3C notice and PTB modification note are
preserved. Source and checksum are recorded in the schema manifest.

## JavaScript dependencies

Key runtime packages:

- React / React DOM — MIT
- Papa Parse — MIT
- ExcelJS — MIT
- xmllint-wasm — MIT; includes libxml2 components under their upstream terms

Run `npm audit` and inspect `package-lock.json` before each release. No package
license is re-licensed by this project.
