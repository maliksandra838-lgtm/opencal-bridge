# Privacy and local processing

OpenCal Bridge has no application backend. CSV/XLSX parsing, diagnostics, XML
generation, schema validation, and report generation run in the user's browser.

## Data handling

- Business data is held in page memory and is cleared when the page is closed or
  reloaded.
- The application does not store certificate rows in `localStorage` or
  `IndexedDB`.
- There is no analytics, advertising, remote font, support widget, account,
  telemetry endpoint, or AI/API integration.
- Downloads are generated locally with browser `Blob` objects.
- Bundled schemas are used for validation; runtime schema resolution does not
  access the network.

Static hosting providers will still receive ordinary requests for the app's
HTML, JavaScript, CSS, and WASM assets. They do not receive the selected file
through OpenCal Bridge code. For maximum control, use a downloaded release on an
offline machine and verify the release hashes.

## Sensitive data

Do not publish a real certificate, spreadsheet, diagnostics file, screenshot, or
audit report in a public Issue. Reproduce problems with synthetic names, IDs,
dates, values, and `example.com` domains. Metadata can remain sensitive even
when result values are removed.

This statement describes project behavior, not the security policy of the user's
browser, extensions, operating system, or chosen hosting provider.
