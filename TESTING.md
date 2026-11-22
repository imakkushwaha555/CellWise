# Cellwise Testing Checklist

## Prerequisites

- Node.js v22 installed
- A supported Microsoft Word desktop or web host with add-in sideloading enabled. Not affiliated
  with or endorsed by Microsoft.

## Manual Sideload Steps

1. Generate certificates (one-time):
   ```bash
   npm run certs
   ```
   This installs local dev certificates under `%USERPROFILE%\.office-addin-dev-certs`.

2. Build the add-in and original icons:
   ```bash
   npm run build
   ```
   This produces `dist/taskpane.js`, `dist/taskpane.html`, and icons in `dist/`.

3. In the host, upload `manifest.xml` using:
   - Go to **Insert > My Add-ins > Upload My Add-in**
   - Select the built `manifest.xml`
   - Click **Add** / **Trust**

4. The task pane should appear on the right side of Word.

## Functional Testing Checklist

### 1. Show Selection

- Place cursor inside a Word table cell.
- Verify the selected cell address is displayed in the task pane ("Selected cell: A1" etc.).
- Change selection to different cells; address updates accordingly.

### 2. Apply Formula

- In a table cell, type a formula starting with `=` (e.g., `=SUM(B2:B5)` or `=A1+B1`).
- Click **Apply** button in the task pane.
- The formula should be stored in the cell's content-control tag prefixed with `fx:`.
- The cell should display the computed result (as plain text).
- Verify that the address label at the top of the pane updates.

### 3. Recalculate Table

- Click **Recalculate table** in the task pane.
- All formula cells in the table should re-evaluate.
- Errors (e.g., `#DIV/0!`) should appear in cells where appropriate, with error text inserted.

### 4. Formula Library

Try each function with the test table below (3x3 grid):

|     | A   | B   | C   |
|-----|-----|-----|-----|
| 1   | 10  | 20  | 30  |
| 2   | 40  | 50  | 60  |
| 3   | 70  | 80  | -   |

Formula              | Expected result
-------------------- | -------------
`=SUM(A1:C3)`        | 360
`=AVERAGE(A1:A3)`    | 40
`=MAX(B1:B3)-MIN(B1:B3)` | 40
`=ROUND(10/3,2)`     | 3.33
`=(A1+B1)^2`         | 900
`=-A1+50%`           | -5
`=ABS(-15)`          | 15
`=COUNT(A1:A3)`      | 3
`=A1*C1`             | 300

### 5. Edge Cases (expected behavior)

| Situation                              | Expected result / message                                                  |
|----------------------------------------|----------------------------------------------------------------------------|
| Cursor not inside a table              | Status: "Place the cursor inside a table cell."                            |
| Formula not starting with `=`          | Status: "Formula must start with ="                                       |
| Non-table document                     | Status: "Place the cursor inside a table."                                 |
| Merged cell with formula                 | Status: "Merged cells not supported; apply formula to a single cell."      |
| Formula with unsupported function      | Error: `#ERR` or status message referencing unknown function               |

## Troubleshooting

| Symptom                                   | Likely cause                                 | Fix                                                               |
|-------------------------------------------|----------------------------------------------|-------------------------------------------------------------------|
| Task pane does not open                   | Manifest not sideloaded correctly            | Re-run `npm run build`, then re-upload `manifest.xml`             |
| "Place the cursor inside a table cell."   | Selection not inside a table cell            | Click inside a Word table cell; ensure the cursor is in a cell, not in text. |
| Formula has no effect                      | Content-control tag conflict or overwrite    | Clear cell content, then re-apply formula.                        |
| Icons not showing in task pane UI         | Office.js CDN may not cache icons            | Ensure icons `icon-16.png`, `icon-32.png`, `icon-80.png` are in `dist/`. |

## Notes

- All calculations stay local; no document data is sent anywhere.
- The formula engine (`src/formula.ts`) is pure dependency-free TypeScript.
- Content controls use the prefix `fx:`; each cell can store exactly one formula tag.
- If the cell already contains text before applying a formula, the `fx:` tag is set on the existing content-control if present, otherwise a new PlainText control is inserted.