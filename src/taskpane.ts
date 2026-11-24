/// <reference types="office-js" />

import { evaluate, addressOf, indexToCol, rangeAddress } from "./formula";
import {
  computeCell,
  formatResult,
  toGrid,
} from "./wordClient";

const TAG = "fx:"; // content-control tag prefix that stores a cell's formula
const $ = (id: string) => document.getElementById(id) as HTMLElement;
const setStatus = (msg: string, err = false) => { $("status").textContent = msg; $("status").className = err ? "err" : ""; };

// Simple debounce: delay in ms after last event before firing
let lastSelectionTimer: NodeJS.Timeout | null = null;
const DEBOUNCE_MS = 300;

export async function run(fn: (ctx: Word.RequestContext) => Promise<void>) {
  try { await Word.run(fn); } catch (e: any) { setStatus(e?.message ?? String(e), true); }
}

// ---------------------------------------------------------------------------
// WordClient integration (mockable). The default real implementation wraps
// Office.js calls; a mock implementation lives in src/wordMock.ts and can be
// swapped in for unit tests without a live Word instance.
// ---------------------------------------------------------------------------

/**
 * Apply the formula shown in the task-pane input to the currently selected cell.
 */
export async function applyFormula(ctx: Word.RequestContext) {
  // Requirement-set check: WordApi 1.3 minimum.
  if (!Office.context.requirements.isSetSupported("WordApi")) {
    return setStatus("This add-in requires WordApi 1.3. Your version does not support it.", true);
  }

  const formula = $("formula") as HTMLInputElement;
  const formulaText = formula.value.trim();
  if (!formulaText.startsWith("=")) return setStatus("Formula must start with =", true);

  const cell = ctx.document.getSelection().parentTableCellOrNullObject;
  const table = ctx.document.getSelection().parentTableOrNullObject;
  cell.load("isNullObject,rowIndex,cellIndex");
  table.load("isNullObject,values");
  await ctx.sync();
  if (cell.isNullObject || table.isNullObject) {
    return setStatus("Place the cursor inside a table cell.", true);
  }

  const result = await computeCell(formulaText, toGrid(table.values ?? []));
  if (result.error) {
    return setStatus(`Formula error: ${result.error}`, true);
  }
  const text = formatResult(result.value);

  // Content-control insertion / update inside the cell.
  const ccs = cell.body.contentControls; ccs.load("items/tag");
  await ctx.sync();
  const existing = ccs.items.find((c) => c.tag.startsWith(TAG));
  if (existing) {
    existing.tag = TAG + formulaText;
    existing.insertText(text, "Replace");
  } else {
    const cc = cell.body.getRange("Content").insertContentControl("PlainText");
    cc.tag = TAG + formulaText;
    cc.title = "Formula";
    cc.insertText(text, "Replace");
  }
  await ctx.sync();
  setStatus(`${addressOf(cell.rowIndex, cell.cellIndex)} ${formulaText} = ${text}`);
}

/**
 * Recalculate all formula cells stored in the selected table.
 */
export async function recalcTable(ctx: Word.RequestContext) {
  if (!Office.context.requirements.isSetSupported("WordApi")) {
    return setStatus("This add-in requires WordApi 1.3. Your version does not support it.", true);
  }

  const table = ctx.document.getSelection().parentTableOrNullObject;
  table.load("isNullObject,values");
  await ctx.sync();
  if (table.isNullObject) return setStatus("Place the cursor inside a table.", true);

  const ccs = table.getRange().contentControls; ccs.load("items/tag");
  await ctx.sync();

  const fx = ccs.items.filter((c) => c.tag.startsWith(TAG));
  const cells = fx.map((c) => {
    const tc = c.parentTableCell;
    tc.load("rowIndex,cellIndex");
    return tc;
  });
  await ctx.sync();

  const grid = toGrid(table.values);
  const errors: string[] = [];

  for (let pass = 0; pass < fx.length + 1; pass++) { // repeat so dependent formulas settle
    fx.forEach((c, i) => {
      try {
        grid[cells[i].rowIndex][cells[i].cellIndex] = evaluate(c.tag.slice(TAG.length), grid);
      } catch { /* reported below */ }
    });
  }
  fx.forEach((c, i) => {
    try {
      const v = evaluate(c.tag.slice(TAG.length), grid);
      c.insertText(String(Math.round(v * 1e10) / 1e10), "Replace");
    } catch (e: any) {
      errors.push(`${addressOf(cells[i].rowIndex, cells[i].cellIndex)}: ${e.message}`);
      c.insertText("#ERR", "Replace");
    }
  });
  await ctx.sync();
  setStatus(
    errors.length ? errors.join("; ") : `Recalculated ${fx.length} formula(s).`,
    errors.length > 0,
  );
}

Office.onReady(() => {
  ($("apply") as HTMLButtonElement).onclick = () => run(applyFormula);
  ($("recalc") as HTMLButtonElement).onclick = () => run(recalcTable);
  ($("formula") as HTMLInputElement).addEventListener("input", () => {
    autoRangeAddress = null;
  });
  Office.context.document.addHandlerAsync(Office.EventType.DocumentSelectionChanged, () => {
    if (lastSelectionTimer) clearTimeout(lastSelectionTimer);
    lastSelectionTimer = setTimeout(() => run(showSelection), DEBOUNCE_MS);
  });
  run(showSelection);
});

let autoRangeAddress: string | null = null;

function clearSelectionDisplay() {
  $("addr").textContent = "—";
  for (const id of ["column-guide", "row-guide"]) {
    const indicator = $(id);
    indicator.textContent = "";
    indicator.hidden = true;
  }
  const formula = $("formula") as HTMLInputElement;
  if (autoRangeAddress && formula.value === autoRangeAddress) formula.value = "";
  autoRangeAddress = null;
}

async function showSelection(ctx: Word.RequestContext) {
  const selection = ctx.document.getSelection();
  const cell = selection.parentTableCellOrNullObject;
  const table = selection.parentTableOrNullObject;
  cell.load("isNullObject,rowIndex,cellIndex");
  table.load("isNullObject");
  await ctx.sync();

  if (table.isNullObject) {
    clearSelectionDisplay();
    return;
  }

  const selectionRange = selection.getRange("Whole");
  const rows = table.rows;
  rows.load("items");
  await ctx.sync();

  const rowCells: Word.TableCellCollection[] = [];
  for (const row of rows.items) {
    const cells = row.cells;
    cells.load("items");
    rowCells.push(cells);
  }
  await ctx.sync();

  const comparisons: Array<{ relation: OfficeExtension.ClientResult<Word.LocationRelation>; cell: Word.TableCell }> = [];
  for (const cells of rowCells) {
    for (const tableCell of cells.items) {
      tableCell.load("rowIndex,cellIndex");
      const relation = selectionRange.compareLocationWith(tableCell.body.getRange("Whole"));
      comparisons.push({ relation, cell: tableCell });
    }
  }

  await ctx.sync();
  const selected: Array<{ row: number; col: number }> = [];
  for (const comparison of comparisons) {
    const relation = comparison.relation.value as string;
    if (["Overlaps", "Contains", "Inside", "Equal"].includes(relation)) {
      selected.push({ row: comparison.cell.rowIndex, col: comparison.cell.cellIndex });
    }
  }

  if (selected.length === 0 && !cell.isNullObject) {
    selected.push({ row: cell.rowIndex, col: cell.cellIndex });
  }
  if (selected.length === 0) {
    clearSelectionDisplay();
    return;
  }

  const rowIndexes = selected.map((item) => item.row);
  const colIndexes = selected.map((item) => item.col);
  const firstRow = Math.min(...rowIndexes);
  const lastRow = Math.max(...rowIndexes);
  const firstCol = Math.min(...colIndexes);
  const lastCol = Math.max(...colIndexes);
  const range = rangeAddress(firstRow, firstCol, lastRow, lastCol);

  $("addr").textContent = range;
  const columnGuide = $("column-guide");
  columnGuide.textContent = firstCol === lastCol
    ? `Column ${indexToCol(firstCol)}`
    : `Columns ${indexToCol(firstCol)}-${indexToCol(lastCol)}`;
  columnGuide.hidden = false;
  const rowGuide = $("row-guide");
  rowGuide.textContent = firstRow === lastRow
    ? `Row ${firstRow + 1}`
    : `Rows ${firstRow + 1}-${lastRow + 1}`;
  rowGuide.hidden = false;

  const formula = $("formula") as HTMLInputElement;
  if (selected.length > 1) {
    if (formula.value.trim() === "" || formula.value === autoRangeAddress) {
      formula.value = range;
      autoRangeAddress = range;
    }
  } else if (autoRangeAddress && formula.value === autoRangeAddress) {
    formula.value = "";
    autoRangeAddress = null;
  }
}