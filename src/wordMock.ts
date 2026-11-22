// In-memory mock implementation of WordClient for unit tests.
// No Word/Office.js required.

import {
  type WordClient,
  type CellRef,
  type CellState,
  type TableSnapshot,
  type RecalcOutcome,
  toGrid,
  computeCell,
  formatResult,
} from "./wordClient.ts";

export class MockWordClient implements WordClient {
  private table: TableSnapshot;
  private selected: CellRef | null;
  private cellCache: Map<string, CellState>;

  constructor() {
    this.table = { values: [] };
    this.selected = null;
    this.cellCache = new Map();
  }

  setSelected(cell: CellRef): void {
    this.selected = cell;
  }

  setTable(values: string[][]): void {
    this.table = { values };
  }

  async getCell(ref: CellRef): Promise<CellState | null> {
    const key = `${ref.row}:${ref.col}`;
    return this.cellCache.get(key) ?? null;
  }

  async setCellText(ref: CellRef, text: string): Promise<void> {
    const key = `${ref.row}:${ref.col}`;
    const existing = this.cellCache.get(key);
    this.cellCache.set(key, {
      ref,
      text,
      formula: existing?.formula ?? null,
    });
  }

  async setCellFormula(ref: CellRef, formula: string, result: number): Promise<void> {
    const key = `${ref.row}:${ref.col}`;
    this.cellCache.set(key, { ref, text: formatResult(result), formula });
    if (this.table.values[ref.row]) {
      this.table.values[ref.row][ref.col] = formatResult(result);
    }
  }

  async getSelectedLocation(): Promise<{ cell: CellRef | null; table: TableSnapshot | null }> {
    return { cell: this.selected, table: this.table };
  }

  async recalcTable(table: TableSnapshot): Promise<RecalcOutcome> {
    const grid = toGrid(table.values);
    const errors: string[] = [];
    const updated: CellRef[] = [];

    for (let pass = 0; pass < this.cellCache.size + 1; pass++) {
      for (const state of this.cellCache.values()) {
        if (!state.formula) continue;
        const val = await computeCell(state.formula, grid);
        if (!val.error) {
          grid[state.ref.row][state.ref.col] = val.value;
        }
      }
    }

    for (const [key, state] of this.cellCache) {
      if (state.formula) {
        const val = await computeCell(state.formula, grid);
        if (val.error) {
          errors.push(`${key}: ${val.error}`);
          state.text = "#ERR";
          table.values[state.ref.row][state.ref.col] = "#ERR";
          grid[state.ref.row][state.ref.col] = null;
        } else {
          state.text = formatResult(val.value);
          table.values[state.ref.row][state.ref.col] = state.text;
          grid[state.ref.row][state.ref.col] = val.value;
          updated.push(state.ref);
        }
      }
    }
    return { grid, errors, updated };
  }
}