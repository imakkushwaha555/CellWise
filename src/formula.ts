// Dependency-free Excel-style formula evaluator (A1 refs, ranges, basic functions).
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

type Tok = { t: "num" | "ref" | "range" | "id" | "op" | "("  | ")" | ","; v: string };

function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  const re = /\s*(?:(\d+\.?\d*|\.\d+)|([A-Za-z]{1,3}\d+:[A-Za-z]{1,3}\d+)|([A-Za-z]{1,3}\d+)(?![A-Za-z(])|([A-Za-z_]+)|([+\-*/^()%,]))/y;
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
    const m = /^([A-Za-z]+)(\d+)$/.exec(ref)!;
    return grid[+m[2] - 1]?.[colToIndex(m[1])] ?? 0;
  };
  const range = (r: string): number[] => {
    const [a, b] = r.split(":");
    const ma = /^([A-Za-z]+)(\d+)$/.exec(a)!, mb = /^([A-Za-z]+)(\d+)$/.exec(b)!;
    const [c1, c2] = [colToIndex(ma[1]), colToIndex(mb[1])].sort((x, y) => x - y);
    const [r1, r2] = [+ma[2] - 1, +mb[2] - 1].sort((x, y) => x - y);
    const vals: number[] = [];
    for (let i = r1; i <= r2; i++) for (let j = c1; j <= c2; j++) { const v = grid[i]?.[j]; if (v != null) vals.push(v); }
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
