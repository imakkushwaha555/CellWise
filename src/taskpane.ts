/// <reference types="office-js" />
import { evaluate, addressOf, Grid } from "./formula";

const TAG = "fx:"; // content-control tag prefix that stores a cell's formula
const $ = (id: string) => document.getElementById(id) as HTMLElement;
const setStatus = (msg: string, err = false) => { $("status").textContent = msg; $("status").className = err ? "err" : ""; };

Office.onReady(() => {
  ($("apply") as HTMLButtonElement).onclick = () => run(applyFormula);
  ($("recalc") as HTMLButtonElement).onclick = () => run(recalcTable);
  Office.context.document.addHandlerAsync(Office.EventType.DocumentSelectionChanged, () => run(showSelection));
  run(showSelection);
});

async function run(fn: (ctx: Word.RequestContext) => Promise<void>) {
  try { await Word.run(fn); } catch (e: any) { setStatus(e?.message ?? String(e), true); }
}

function toGrid(values: string[][]): Grid {
  return values.map(r => r.map(v => {
    const n = parseFloat(v.replace(/[,\s$€£]/g, ""));
    return isNaN(n) ? null : n;
  }));
}

async function showSelection(ctx: Word.RequestContext) {
  const cell = ctx.document.getSelection().parentTableCellOrNullObject;
  cell.load("isNullObject,rowIndex,cellIndex");
  await ctx.sync();
  $("addr").textContent = cell.isNullObject ? "—" : addressOf(cell.rowIndex, cell.cellIndex);
}

async function applyFormula(ctx: Word.RequestContext) {
  const formula = ($("formula") as HTMLInputElement).value.trim();
  if (!formula.startsWith("=")) return setStatus("Formula must start with =", true);
  const cell = ctx.document.getSelection().parentTableCellOrNullObject;
  const table = ctx.document.getSelection().parentTableOrNullObject;
  cell.load("isNullObject,rowIndex,cellIndex"); table.load("isNullObject,values");
  await ctx.sync();
  if (cell.isNullObject || table.isNullObject) return setStatus("Place the cursor inside a table cell.", true);

  const result = evaluate(formula, toGrid(table.values));
  const text = String(Math.round(result * 1e10) / 1e10);

  const ccs = cell.body.contentControls; ccs.load("items/tag");
  await ctx.sync();
  const existing = ccs.items.find(c => c.tag.startsWith(TAG));
  if (existing) { existing.tag = TAG + formula; existing.insertText(text, "Replace"); }
  else {
    const cc = cell.body.getRange("Content").insertContentControl("PlainText");
    cc.tag = TAG + formula; cc.title = "Formula"; cc.insertText(text, "Replace");
  }
  await ctx.sync();
  setStatus(`${addressOf(cell.rowIndex, cell.cellIndex)} ${formula} = ${text}`);
}

async function recalcTable(ctx: Word.RequestContext) {
  const table = ctx.document.getSelection().parentTableOrNullObject;
  table.load("isNullObject,values");
  await ctx.sync();
  if (table.isNullObject) return setStatus("Place the cursor inside a table.", true);

  const ccs = table.getRange().contentControls; ccs.load("items/tag");
  await ctx.sync();
  const fx = ccs.items.filter(c => c.tag.startsWith(TAG));
  const cells = fx.map(c => { const tc = c.parentTableCell; tc.load("rowIndex,cellIndex"); return tc; });
  await ctx.sync();

  const grid = toGrid(table.values);
  const errors: string[] = [];
  for (let pass = 0; pass < fx.length + 1; pass++) { // repeat so dependent formulas settle
    fx.forEach((c, i) => {
      try { grid[cells[i].rowIndex][cells[i].cellIndex] = evaluate(c.tag.slice(TAG.length), grid); } catch { /* reported below */ }
    });
  }
  fx.forEach((c, i) => {
    try {
      const v = evaluate(c.tag.slice(TAG.length), grid);
      c.insertText(String(Math.round(v * 1e10) / 1e10), "Replace");
    } catch (e: any) { errors.push(`${addressOf(cells[i].rowIndex, cells[i].cellIndex)}: ${e.message}`); c.insertText("#ERR", "Replace"); }
  });
  await ctx.sync();
  setStatus(errors.length ? errors.join("; ") : `Recalculated ${fx.length} formula(s).`, errors.length > 0);
}
