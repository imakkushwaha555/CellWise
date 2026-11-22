// Fail if any dependency in the generated SBOM lacks an approved permissive license.
import { readFileSync, writeFileSync } from "node:fs";

const [sbomPath, reportPath] = process.argv.slice(2);
if (!sbomPath || !reportPath) {
  throw new Error("Usage: node scripts/check-licenses.mjs <sbom.json> <report.txt>");
}

const allowedLicenses = new Set([
  "0BSD",
  "Apache-2.0",
  "BlueOak-1.0.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "CC0-1.0",
  "ISC",
  "MIT",
  "MIT-0",
  "Unlicense",
  "Zlib",
]);
const sbom = JSON.parse(readFileSync(sbomPath, "utf8"));
if (sbom.bomFormat !== "CycloneDX" || !Array.isArray(sbom.components) || sbom.components.length === 0) {
  throw new Error("SBOM is missing CycloneDX dependency components; refusing to skip the license check.");
}

function declaredLicenses(component) {
  const entries = component.licenses ?? [];
  if (entries.length === 0) return [];
  return entries.map((entry) => {
    const value = entry.expression
      ?? entry.license?.id
      ?? entry.license?.name;
    if (typeof value !== "string" || value.trim() === "") return null;
    return value.trim();
  });
}

function isPermissive(expression) {
  const tokens = expression.match(/[A-Za-z0-9.-]+/g) ?? [];
  if (tokens.length === 0) return false;
  return tokens.every((token) => token === "AND" || token === "OR" || allowedLicenses.has(token));
}

const failures = [];
const reportLines = [
  "Cellwise dependency license report",
  "Policy: every SBOM component must declare only an approved permissive SPDX license.",
  "",
];

for (const component of sbom.components) {
  const licenses = declaredLicenses(component);
  if (
    licenses.length === 0
    || licenses.some((license) => license === null || !isPermissive(license))
  ) {
    failures.push(
      `${component.name ?? "(unnamed)"}@${component.version ?? "(unknown version)"}: ${licenses.join(", ") || "no declared license"}`,
    );
    continue;
  }
  reportLines.push(`${component.name}@${component.version}: ${licenses.join(", ")}`);
}

if (failures.length > 0) {
  throw new Error(`Unapproved or missing dependency licenses:\n- ${failures.join("\n- ")}`);
}

const header = reportLines.slice(0, 3);
const rows = reportLines.slice(3).sort((left, right) => left.localeCompare(right));
writeFileSync(reportPath, `${[...header, ...rows].join("\n")}\n`, "utf8");
console.log(`License check passed for ${sbom.components.length} SBOM components.`);
