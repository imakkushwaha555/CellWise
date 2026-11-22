// Abstraction over the Word integration surface used by the task pane.
// A real implementation wraps Office.js (OfficeWordClient); a mock allows
// unit testing the task-pane logic without Word.

import { evaluate, type Grid } from "./formula.ts";

export interface CellRef { row: number; col: number; }

export interface TableSnapshot { values: string[][]; }

export interface CellState { ref: CellRef; text: string; formula: string | null; }

export interface RecalcOutcome { grid: Grid; errors: string[]; updated: CellRef[]; }

export interface WordClient {
  getSelectedLocation(): Promise<{ cell: CellRef | null; table: TableSnapshot | null }>;
  getCell(ref: CellRef): Promise<CellState | null>;
  setCellText(ref: CellRef, text: string): Promise<void>;
  recalcTable(table: TableSnapshot): Promise<RecalcOutcome>;
}

export function toGrid(values: string[][]): Grid {
  return values.map(r => r.map(v => {
    const n = parseFloat(String(v).replace(/[,\s$€£]/g, ""));
    return isNaN(n) ? null : n;
  }));
}

export function formatResult(v: number): string {
  return String(Math.round(v * 1e10) / 1e10);
}

export async function computeCell(formula: string, grid: Grid): Promise<{ value: number; error: string | null }> {
  try {
    const v = evaluate(formula, grid);
    return { value: v, error: null };
  } catch (e: any) {
    return { value: 0, error: e?.message ?? String(e) };
  }
}
