# Cellwise Installation Guide

Cellwise is an open-source Word add-in for A1-style formulas in document tables. It runs entirely in your browser/Office host and does not send document contents to Cellwise.

## What you need

- Microsoft Word on Windows, Mac, or Word on the web
- A Word table to work with
- About 5 minutes

## What is in this ZIP

| File | Purpose |
|------|---------|
| `manifest.xml` | Office add-in manifest that tells Word where to load Cellwise |
| `taskpane.html` | Task-pane user interface |
| `taskpane.js` | Add-in logic and formula engine |
| `icon-16.png`, `icon-32.png`, `icon-80.png` | Add-in icons |

## Install on Windows (Word desktop)

1. Extract `Cellwise-1.0.0.zip` to a folder you own, for example `C:\Users\YourName\Cellwise`.
2. Open Word.
3. Choose **Insert > My Add-ins > Upload My Add-in**.
4. Choose **Browse**, then select `manifest.xml` from the extracted folder.
5. Choose **Add** or **Trust**.
6. The Cellwise task pane should appear on the right side of Word.

If **Insert > My Add-ins** is not available, try **Home > Add-ins > Advanced > Upload My Add-in**. Availability depends on your Word build and organization policy.

## Install on macOS (Word desktop)

1. Extract `Cellwise-1.0.0.zip` to a folder you own.
2. Open Word.
3. Choose **Insert > Add-ins > My Add-ins**.
4. Choose **Upload My Add-in**.
5. Select `manifest.xml` from the extracted folder.
6. Choose **Add** or **Trust**.
7. The Cellwise task pane should appear on the right side of Word.

## Install on Word on the web

1. Extract `Cellwise-1.0.0.zip` to a folder you own.
2. Open Word on the web at office.com.
3. Open or create a document.
4. Choose **Insert > Add-ins > My Add-ins**.
5. Choose **Upload My Add-in**.
6. Select `manifest.xml` from the extracted folder.
7. Choose **Add** or **Trust**.
8. The Cellwise task pane should appear on the right side of Word.

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

## Requirements

- WordApi 1.3 or later
- Word desktop or Word on the web with add-in sideloading enabled
- Internet access to load the add-in files and Office.js from Microsoft

## Privacy

Cellwise reads table values through the Office.js host API and evaluates formulas locally in the add-in. It contains no telemetry and does not send document contents to Cellwise. The add-in files are downloaded from the configured HTTPS host; Office.js is loaded from Microsoft’s official Office.js URL.

## Remove Cellwise

1. Open Word.
2. Choose **Insert > My Add-ins > My Add-ins**.
3. Select Cellwise and choose **Remove**.
4. Close and reopen Word.

## Support

Open an issue: https://github.com/imakkushwaha555/CellWise/issues

Include your Word version, operating system, and a description of the problem. Never attach documents or personal data.

Not affiliated with or endorsed by Microsoft.
