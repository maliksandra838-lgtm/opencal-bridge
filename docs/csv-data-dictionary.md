# CSV/XLSX data dictionary — v0.1

The first worksheet of an XLSX file follows the same columns as CSV. Column
names are case-sensitive. Certificate metadata repeats on every result row and
must be identical.

| Column | Type | Required | Meaning |
| --- | --- | --- | --- |
| `certificate_id` | non-empty text | yes | Stable unique identifier for the generated DCC |
| `country_code` | `[A-Z]{2}` | yes | ISO 3166-1 alpha-2-style country code |
| `language` | `en` or `zh` | yes | Mandatory DCC content language |
| `calibration_date` | `YYYY-MM-DD` | yes | Begin and end performance date in v0.1 |
| `laboratory_name` | text | yes | Calibration laboratory display name |
| `customer_name` | text | yes | Customer display name |
| `responsible_person` | text | yes | Responsible person; marked as main signer metadata, not a digital signature |
| `item_name` | text | yes | Calibrated item name |
| `item_serial` | text | yes | Manufacturer-issued item identification |
| `method` | text | yes | Method display name; no conformity is inferred |
| `result_name` | text | yes | Name of the scalar comparison point |
| `reference_value` | finite number | yes | Reference value |
| `indication` | finite number | yes | Item indication |
| `error` | finite number | yes | Reported indication minus reference value |
| `unit` | tested token | yes | `kg`, `g`, `mg`, `Cel`, `K`, `Pa`, `kPa`, `MPa`, `N`, `m`, `mm`, `um`, `V`, `A`, `Hz`, or `s` |
| `expanded_uncertainty` | number ≥ 0 | yes | Expanded measurement uncertainty, same unit as the error |
| `coverage_factor` | number > 0 | yes | Coverage factor `k`; report uses coverage probability 0.95 and normal distribution in v0.1 |

The conversion preserves input numbers but does not infer rounding,
significant digits, correlations, guard bands, or uncertainty budgets. Units
outside the tested mapping are warned and require manual review.
