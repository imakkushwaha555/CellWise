# Cellwise

Cellwise is an open-source task-pane add-in for A1-style formulas in tables in Microsoft Word.
Not affiliated with or endorsed by Microsoft.

The spreadsheet-style formulas work directly with table cells, so no helper rows or columns are
needed. Calculations run locally; document contents are not sent to a service.

## Features

- Address cells using columns A, B, C … Z, AA, AB … and rows 1, 2, 3 ….
- Apply formulas such as `=SUM(B2:B5)` or `=A1+B1`.
- Recalculate formulas stored in table-cell content controls.
- Use a small, original formula engine with no runtime dependencies.

## Screenshots

Screenshots and an animated demonstration will be added after live desktop and web testing.

## Addressing

Addresses follow the usual A1 convention: column letters come first, then the row number.
The top-left table cell is A1; B3 is column 2, row 3. Row 1 is the first table row, including a
header row if the table has one. Columns continue after Z as AA, AB, and onward.

## Supported formulas

Current functions: `SUM`, `AVERAGE`, `MIN`, `MAX`, `COUNT`, `ABS`, and `ROUND`.
Current operators: `+`, `-`, `*`, `/`, `^`, and `%`.

The formula engine is intentionally an independent subset, not a promise of full spreadsheet
compatibility. See [TESTING.md](TESTING.md) for the current manual test checklist and limitations.

## Install for Windows testing

The add-in page must be hosted over HTTPS. The Windows installer registers its manifest through a
trusted network-share catalog, which Microsoft documents for testing only and does not support for
production. You must provide an existing writable UNC share; the installer does not create shares,
change firewall settings, or install certificates. See [INSTALLER_TESTING.md](INSTALLER_TESTING.md)
for build and installation steps.

The installer is unsigned, so Windows may display an unknown-publisher or SmartScreen warning.
Microsoft notes that new files can still trigger warnings while reputation builds, even if signed.
The [SignPath Foundation free OSS signing program](https://signpath.org/) is a possible option,
but Cellwise has not applied and acceptance is not guaranteed. See
[INSTALLER_TESTING.md](INSTALLER_TESTING.md) for current signing status.

## Local development

Prerequisites: Node.js and a supported Microsoft Word host with add-in sideloading enabled.

```powershell
npm install
npm run build
npm run certs
npm run serve
```

Keep the local development server running while testing. See [TESTING.md](TESTING.md) for the
formula and host verification checklist.

## Development

```powershell
npm run test
npm run typecheck
npm run build
npm run validate
```

## Privacy

Formula evaluation and document operations are local to the add-in host. Cellwise does not include
telemetry or send document data over the network. The Office.js library is loaded from its official
hosted script URL. A standalone privacy statement is planned for Phase C.

## Project status and contribution

Live host behavior has not yet been verified. See [PROGRESS.md](PROGRESS.md),
[DECISIONS.md](DECISIONS.md), and [TESTING.md](TESTING.md) for evidence and outstanding checks.
Contribution and release guidance will be added before the open-source release.

## License and disclaimer

Cellwise is intended to be provided under the MIT License. The license file is planned for Phase C.
Not affiliated with or endorsed by Microsoft.
