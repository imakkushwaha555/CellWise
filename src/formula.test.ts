import { evaluate, addressOf, parseAddress, rangeAddress } from "./formula.ts";
const g = [[1, 2, 3], [4, 5, 6], [7, 8, null]];
const eq = (f: string, want: number) => { const got = evaluate(f, g); console.log(got === want ? "ok  " : "FAIL", f, got); if (got !== want) process.exitCode = 1; };
eq("=A1+B2*C3", 1); eq("=SUM(A1:C3)", 36); eq("=AVERAGE(A1:A3)", 4);
eq("=MAX(B1:B3)-MIN(B1:B3)", 6); eq("=ROUND(10/3,2)", 3.33); eq("=(A1+B1)^2", 9); eq("=-A1+50%", -0.5);
eq("=AAAA1", 0); eq("=SUM(AAAA1:A1)", 6);
const addresses = [
  { row: 0, col: 0, address: "A1" },
  { row: 2, col: 1, address: "B3" },
  { row: 0, col: 26, address: "AA1" },
  { row: 0, col: 27, address: "AB1" },
  { row: 0, col: 18278, address: "AAAA1" },
];
if (rangeAddress(2, 1, 0, 0) !== "A1:B3") throw new Error("Range normalization failed.");
console.log("ok   rangeAddress normalization");

for (const value of addresses) {
  const actual = addressOf(value.row, value.col);
  if (actual !== value.address) throw new Error(`Expected ${value.address}, got ${actual}`);
  const parsed = parseAddress(value.address);
  if (parsed.row !== value.row || parsed.col !== value.col) {
    throw new Error(`Expected ${value.address} to parse to ${value.row},${value.col}`);
  }
  console.log(`ok   ${value.address} round-trip`);
}

try {
  evaluate("=A0", g);
  throw new Error("Expected row 0 to be rejected.");
} catch (error) {
  if (!(error instanceof Error) || !error.message.includes("Invalid cell address")) throw error;
}
