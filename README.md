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

## Install and sideload

Prerequisites: Node.js and a supported Microsoft Word host with add-in sideloading enabled.

```powershell
npm install
npm run build
npm run certs
npm run serve
```

In the Word host, upload `manifest.xml` using **Insert > Add-ins > My Add-ins > Upload My Add-in**.
Keep the local development server running while testing. See [TESTING.md](TESTING.md) for detailed
desktop and web verification steps.

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
