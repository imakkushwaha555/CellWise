// Verify that package, Office manifest, installer, and tag versions agree.
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const manifest = readFileSync(join(root, "manifest.xml"), "utf8");
const packageScript = readFileSync(join(root, "scripts", "package.mjs"), "utf8");

if (!/^\d+\.\d+\.\d+$/.test(packageJson.version)) {
  throw new Error(`Expected a numeric SemVer version; found ${packageJson.version}.`);
}

const manifestVersion = manifest.match(/<Version>([^<]+)<\/Version>/)?.[1];
const installerVersion = `${packageJson.version}.0`;
if (manifestVersion !== installerVersion) {
  throw new Error(
    `Office manifest version ${manifestVersion ?? "(missing)"} must equal ${installerVersion}.`,
  );
}
if (!packageScript.includes("`/DPRODUCT_VERSION_NUMERIC=${version}.0`")) {
  throw new Error("Installer packaging no longer derives its numeric version from package.json.");
}

const releaseTag = process.env.GITHUB_REF_NAME;
if (releaseTag && releaseTag !== `v${packageJson.version}`) {
  throw new Error(`Release tag ${releaseTag} must match v${packageJson.version}.`);
}

console.log(`Version check passed: package ${packageJson.version}, Office/installer ${installerVersion}.`);
