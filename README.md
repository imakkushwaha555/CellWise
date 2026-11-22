# Table Formulas for Word (v0.1)

Excel-style `A1` formulas in Word tables, so you do not need temporary helper rows/columns
labeling A, B, C / 1, 2, 3.

## Run

```bash
npm install
npm run test        # formula engine tests
npm run typecheck   # strict TypeScript check (tsc --noEmit)
npm run build       # bundle taskpane.js + copy taskpane.html + generate placeholder icons
npm run validate    # validate manifest.xml against Office add-in schema
npm run certs       # one-time local HTTPS cert (uses office-addin-dev-certs)
npm run serve       # serves https://localhost:3000 (cross-platform; reads certs from ~/.office-addin-dev-certs)
```

Then in Word: **Insert > Add-ins > My Add-ins > Upload My Add-in > manifest.xml**
(sideload the manifest; build step generates `dist/icon-16.png`, `dist/icon-32.png`, `dist/icon-80.png`).

## Use

Click in a table cell, type `=SUM(B2:B5)` (or `=A1+B1`), and click **Apply**. "Recalculate table"
refreshes all formulas in the table. Formulas are stored in content-control tags on each cell
(prefixed `fx:`); results are plain text.

## Status

- Formula engine: tested (`npm run test` — 8/8 checks).
- Word integration (`src/taskpane.ts`): **unverified against a live Word instance**; see
  [TESTING.md](TESTING.md) for a manual sideload and functional checklist.
- Manifest: validated against Office add-in schema (`npm run validate`).
- Project state and decisions: see [PROGRESS.md](PROGRESS.md) and [DECISIONS.md](DECISIONS.md).

## Legal / licensing

- See [LEGAL_NOTES.md](LEGAL_NOTES.md) for licensing safeguards and constraints.
- Not affiliated with or endorsed by Microsoft.
