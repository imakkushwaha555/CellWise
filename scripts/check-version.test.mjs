// Verify that release tags must exactly match the package SemVer.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const checker = join(root, "scripts", "check-version.mjs");

const matchingTag = spawnSync(process.execPath, [checker], {
  encoding: "utf8",
  env: { ...process.env, GITHUB_REF_NAME: "v1.0.1" },
});
assert.equal(matchingTag.status, 0, matchingTag.stderr);

const mismatchedTag = spawnSync(process.execPath, [checker], {
  encoding: "utf8",
  env: { ...process.env, GITHUB_REF_NAME: "v0.1.0" },
});
assert.notEqual(mismatchedTag.status, 0);
assert.match(mismatchedTag.stderr, /must match v1\.0\.1/);
console.log("version gate checks passed");
