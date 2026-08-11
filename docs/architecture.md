# Architecture

```text
File → CSV/XLSX parser → CalibrationRecord → diagnostics
                                ↓
                        deterministic DCC mapper
                                ↓
                XML ────────────┼──────────── audit HTML
                                ↓
                bundled PTB schemas + xmllint-wasm
```

The internal `CalibrationRecord` is independent of the DCC XML structure. The
parser normalizes input, the semantic stage emits stable diagnostics, and the
mapper serializes escaped text into a fixed DCC 3.3.0 structure. No timestamps or
random IDs are inserted, so identical inputs produce byte-identical XML.

The current repository is intentionally a single Vite application. When mapping
profiles stabilize, core/importer/DCC/validator packages can be separated
without changing the public diagnostic contract.
