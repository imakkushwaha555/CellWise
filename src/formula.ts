// Dependency-free A1-style formula evaluator (references, ranges, basic functions).
// Original code, no third-party sources.

export type Grid = (number | null)[][]; // numeric view of the table, null = empty/non-numeric

export function colToIndex(col: string): number {
  let n = 0;
  for (const ch of col.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

export function indexToCol(i: number): string {
  let s = "";
  for (i += 1; i > 0; i = Math.floor((i - 1) / 26)) s = String.fromCharCode(65 + ((i - 1) % 26)) + s;
  return s;
}

export const addressOf = (row: number, col: number) => `${indexToCol(col)}${row + 1}`;

export function parseAddress(address: string): { row: number; col: number } {
  const match = /^([A-Za-z]+)([1-9]\d*)$/.exec(address);
  if (!match) throw new Error(`Invalid cell address '${address}'`);

  const col = colToIndex(match[1]);
  const row = Number(match[2]) - 1;
  if (!Number.isSafeInteger(col) || col < 0 || !Number.isSafeInteger(row)) {
    throw new Error(`Invalid cell address '${address}'`);
  }
  return { row, col };
}

type Tok = { t: "num" | "ref" | "range" | "id" | "op" | "("  | ")" | ","; v: string };

function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  const re = /\s*(?:(\d+\.?\d*|\.\d+)|([A-Za-z]+\d+:[A-Za-z]+\d+)|([A-Za-z]+\d+)(?![A-Za-z(])|([A-Za-z_]+)|([+\-*/^()%,]))/y;
  let m: RegExpExecArray | null;
  let pos = 0;
  while (pos < src.length) {
    re.lastIndex = pos;
    m = re.exec(src);
    if (!m) { if (src.slice(pos).trim() === "") break; throw new Error(`Unexpected '${src.slice(pos).trim()[0]}'`); }
    pos = re.lastIndex;
    if (m[1]) out.push({ t: "num", v: m[1] });
    else if (m[2]) out.push({ t: "range", v: m[2] });
    else if (m[3]) out.push({ t: "ref", v: m[3] });
    else if (m[4]) out.push({ t: "id", v: m[4].toUpperCase() });
    else if (m[5] === "(") out.push({ t: "(", v: "(" });
    else if (m[5] === ")") out.push({ t: ")", v: ")" });
    else if (m[5] === ",") out.push({ t: ",", v: "," });
    else out.push({ t: "op", v: m[5] });
  }
  return out;
}

const FUNCS: Record<string, (a: number[]) => number> = {
  SUM: a => a.reduce((x, y) => x + y, 0),
  AVERAGE: a => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0),
  MIN: a => Math.min(...a),
  MAX: a => Math.max(...a),
  COUNT: a => a.length,
  ABS: a => Math.abs(a[0]),
  ROUND: a => { const d = a[1] ?? 0; const f = 10 ** d; return Math.round(a[0] * f) / f; },
};

export function evaluate(formula: string, grid: Grid): number {
  const toks = tokenize(formula.replace(/^=/, ""));
  let p = 0;
  const peek = () => toks[p];
  const next = () => toks[p++];

  const cell = (ref: string) => {
    const { row, col } = parseAddress(ref);
    return grid[row]?.[col] ?? 0;
  };
  const range = (r: string): number[] => {
    const [a, b] = r.split(":");
    const start = parseAddress(a);
    const end = parseAddress(b);
    const [c1, c2] = [start.col, end.col].sort((x, y) => x - y);
    const [r1, r2] = [start.row, end.row].sort((x, y) => x - y);
    const vals: number[] = [];
    const lastRow = Math.min(r2, grid.length - 1);
    const columnCount = grid.reduce((max, row) => Math.max(max, row.length), 0);
    const lastColumn = Math.min(c2, columnCount - 1);
    if (r1 > lastRow || c1 > lastColumn) return vals;
    for (let i = r1; i <= lastRow; i++) {
      for (let j = c1; j <= lastColumn; j++) {
        const value = grid[i]?.[j];
        if (value != null) vals.push(value);
      }
    }
    return vals;
  };

  function expr(): number {
    let v = term();
    while (peek()?.t === "op" && (peek().v === "+" || peek().v === "-")) v = next().v === "+" ? v + term() : v - term();
    return v;
  }
  function term(): number {
    let v = power();
    while (peek()?.t === "op" && (peek().v === "*" || peek().v === "/")) {
      const op = next().v; const r = power();
      if (op === "/" && r === 0) throw new Error("Division by zero");
      v = op === "*" ? v * r : v / r;
    }
    return v;
  }
  function power(): number {
    const b = unary();
    if (peek()?.t === "op" && peek().v === "^") { next(); return b ** power(); }
    return b;
  }
  function unary(): number {
    if (peek()?.t === "op" && (peek().v === "-" || peek().v === "+")) return next().v === "-" ? -unary() : unary();
    let v = atom();
    while (peek()?.t === "op" && peek().v === "%") { next(); v /= 100; }
    return v;
  }
  function atom(): number {
    const t = next();
    if (!t) throw new Error("Unexpected end");
    if (t.t === "num") return parseFloat(t.v);
    if (t.t === "ref") return cell(t.v);
    if (t.t === "(") { const v = expr(); if (next()?.t !== ")") throw new Error("Missing )"); return v; }
    if (t.t === "id") {
      const fn = FUNCS[t.v];
      if (!fn) throw new Error(`Unknown function ${t.v}`);
      if (next()?.t !== "(") throw new Error("Expected (");
      const args: number[] = [];
      while (peek() && peek().t !== ")") {
        if (peek().t === "range") args.push(...range(next().v));
        else args.push(expr());
        if (peek()?.t === ",") next();
      }
      if (next()?.t !== ")") throw new Error("Missing )");
      return fn(args);
    }
    throw new Error(`Unexpected '${t.v}'`);
  }

  const result = expr();
  if (p < toks.length) throw new Error(`Unexpected '${toks[p].v}'`);
  return result;
}
