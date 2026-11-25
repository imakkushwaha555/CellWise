# Cellwise support

## Supported scope

Cellwise is an open-source Word add-in for A1-style formulas in document tables. It runs in Word desktop and Word on the web. Live Word validation across all Word versions is still pending.

## Installation

1. Download `Cellwise-1.0.0.zip` from the GitHub release.
2. Extract it to a folder you own.
3. Open Word.
4. Choose **Insert > My Add-ins > Upload My Add-in**.
5. Select `manifest.xml` from the extracted folder.
6. Choose **Add** or **Trust**.
7. The Cellwise task pane should appear on the right side of Word.

If **Insert > My Add-ins** is not available, try **Home > Add-ins > Advanced > Upload My Add-in**. Availability varies by Word build and organization policy.

## Using Cellwise

1. Place your cursor inside any cell of a Word table.
2. The task pane shows the active cell address, for example `A1`.
3. Enter a formula beginning with `=`, for example `=SUM(B2:B5)` or `=A1+B1`.
4. Choose **Apply**.
5. Choose **Recalculate table** after changing input values.

The first cell of each table is `A1`. Columns increase left to right: `A`, `B`, `C`, ..., `Z`, `AA`, `AB`, and so on. Rows increase top to bottom: `1`, `2`, `3`, and so on.

## Supported formulas

| Function | Example |
|----------|---------|
| SUM | `=SUM(B2:B5)` |
| AVERAGE | `=AVERAGE(A1:A4)` |
| MIN | `=MIN(B1:B3)` |
| MAX | `=MAX(B1:B3)` |
| COUNT | `=COUNT(A1:A3)` |
| ABS | `=ABS(-15)` |
| ROUND | `=ROUND(10/3,2)` |

Operators: `+`, `-`, `*`, `/`, `^`, `%`

## Remove Cellwise

1. Open Word.
2. Choose **Insert > My Add-ins > My Add-ins**.
3. Select Cellwise and choose **Remove**.
4. Close and reopen Word.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Task pane does not open | Manifest not uploaded correctly | Re-upload `manifest.xml` via **Insert > My Add-ins > Upload My Add-in** |
| "Place the cursor inside a table cell." | Selection not inside a table cell | Click inside a Word table cell |
| Formula has no effect | Content-control tag conflict | Clear cell content, then re-apply formula |
| Task pane does not load | Add-in host policy or network issue | Check that `taskpane.html` opens in your browser; check Word add-in policies with your administrator |

## Privacy

Cellwise reads table values through the Office.js host API and evaluates formulas locally in the add-in. It contains no telemetry and does not send document contents to Cellwise. The add-in files are downloaded from the configured HTTPS host; Office.js is loaded from Microsoft’s official Office.js URL.

## Report a problem

Open an issue: https://github.com/imakkushwaha555/CellWise/issues

Include your Word version, operating system, and a description of the problem. Never attach documents or personal data.

Not affiliated with or endorsed by Microsoft.
