import assert from "node:assert/strict";
import { MockWordClient } from "./wordMock.ts";
import { computeCell, formatResult, toGrid } from "./wordClient.ts";

const grid = toGrid([["10", "20"], ["30", "$40"]]);
assert.deepEqual(grid, [[10, 20], [30, 40]]);
assert.equal(formatResult(10 / 3), "3.3333333333");

const sum = await computeCell("=SUM(A1:B1)", grid);
assert.equal(sum.error, null);
assert.equal(sum.value, 30);

const invalid = await computeCell("=1/0", grid);
assert.equal(invalid.error, "Division by zero");

const mock = new MockWordClient();
mock.setTable([["10", "20"], ["30", "40"]]);
await mock.setCellFormula({ row: 0, col: 2 }, "=A1+B1", 30);
await mock.setCellFormula({ row: 1, col: 2 }, "=C1+A2", 60);

const location = await mock.getSelectedLocation();
assert.deepEqual(location.table, { values: [["10", "20", "30"], ["30", "40", "60"]] });

const outcome = await mock.recalcTable(location.table!);
assert.deepEqual(outcome.errors, []);
assert.equal(outcome.updated.length, 2);
assert.equal(location.table!.values[1][2], "60");

const errorMock = new MockWordClient();
errorMock.setTable([["10"], ["0"]]);
await errorMock.setCellFormula({ row: 0, col: 1 }, "=A1/0", 0);
const errorLocation = await errorMock.getSelectedLocation();
const errorOutcome = await errorMock.recalcTable(errorLocation.table!);
assert.deepEqual(errorOutcome.errors, ["0:1: Division by zero"]);
assert.equal(errorLocation.table!.values[0][1], "#ERR");
assert.equal((await errorMock.getCell({ row: 0, col: 1 }))?.text, "#ERR");

console.log("word client checks passed");
