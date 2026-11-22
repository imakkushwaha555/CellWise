import { evaluate, addressOf } from "./formula.ts";
const g = [[1, 2, 3], [4, 5, 6], [7, 8, null]];
const eq = (f: string, want: number) => { const got = evaluate(f, g); console.log(got === want ? "ok  " : "FAIL", f, got); if (got !== want) process.exitCode = 1; };
eq("=A1+B2*C3", 1); eq("=SUM(A1:C3)", 36); eq("=AVERAGE(A1:A3)", 4);
eq("=MAX(B1:B3)-MIN(B1:B3)", 6); eq("=ROUND(10/3,2)", 3.33); eq("=(A1+B1)^2", 9); eq("=-A1+50%", -0.5);
console.log(addressOf(0, 27) === "AB1" ? "ok   AB1" : "FAIL addr");
