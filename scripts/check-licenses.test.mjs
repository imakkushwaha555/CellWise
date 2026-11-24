// Verify that the license gate accepts permissive licenses and rejects copyleft.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const checker = join(root, "scripts", "check-licenses.mjs");
const directory = mkdtempSync(join(tmpdir(), "cellwise-license-check-"));
const sbomPath = join(directory, "sbom.json");
const reportPath = join(directory, "licenses.txt");

try {
  writeFileSync(sbomPath, JSON.stringify({
    bomFormat: "CycloneDX",
    components: [{ name: "permissive", version: "1.0.0", licenses: [{ license: { id: "MIT" } }] }],
  }));
  const permissive = spawnSync(process.execPath, [checker, sbomPath, reportPath], { encoding: "utf8" });
  assert.equal(permissive.status, 0, permissive.stderr);
  assert.match(readFileSync(reportPath, "utf8"), /permissive@1\.0\.0: MIT/);

  writeFileSync(sbomPath, JSON.stringify({
    bomFormat: "CycloneDX",
    components: [{ name: "copyleft", version: "1.0.0", licenses: [{ license: { id: "GPL-3.0-only" } }] }],
  }));
  const copyleft = spawnSync(process.execPath, [checker, sbomPath, reportPath], { encoding: "utf8" });
  assert.notEqual(copyleft.status, 0);
  assert.match(copyleft.stderr, /GPL-3\.0-only/);
  console.log("license gate checks passed");
} finally {
  rmSync(directory, { recursive: true, force: true });
}
