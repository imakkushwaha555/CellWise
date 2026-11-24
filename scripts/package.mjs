// Build the add-in payload, hosted manifest, ZIP, and pinned NSIS installer.
import { execFileSync, execSync, spawnSync } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const releaseDir = join(root, "release");
const stagingDir = join(releaseDir, "staging");
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const version = packageJson.version;
const baseUrl = process.env.CELLWISE_BASE_URL?.replace(/\/+$/, "");
const repositoryUrl = process.env.CELLWISE_REPOSITORY_URL?.replace(/\/+$/, "");

if (process.platform !== "win32") {
  throw new Error("Windows installer packaging must run on Windows.");
}
if (!/^\d+\.\d+\.\d+$/.test(version)) {
  throw new Error(`Installer packaging requires a numeric SemVer version; found: ${version}`);
}
if (!baseUrl || !repositoryUrl) {
  throw new Error("Set CELLWISE_BASE_URL and CELLWISE_REPOSITORY_URL to the deployed HTTPS URLs.");
}
const parsedBase = new URL(baseUrl);
const parsedRepository = new URL(repositoryUrl);
if (
  parsedBase.protocol !== "https:"
  || !parsedBase.hostname.endsWith(".github.io")
  || parsedBase.pathname.replace(/\/+$/, "").toLowerCase() !== "/cellwise"
  || parsedBase.search
  || parsedBase.hash
) {
  throw new Error(`CELLWISE_BASE_URL must be the deployed GitHub Pages URL for /cellwise; got: ${baseUrl}`);
}
if (
  parsedRepository.protocol !== "https:"
  || parsedRepository.hostname !== "github.com"
  || parsedRepository.pathname.split("/").filter(Boolean).length !== 2
  || parsedRepository.pathname.split("/")[2]?.toLowerCase() !== "cellwise"
  || repositoryUrl.includes("OWNER")
) {
  throw new Error(`CELLWISE_REPOSITORY_URL must be the real GitHub cellwise repository URL; got: ${repositoryUrl}`);
}
const repositoryOwner = parsedRepository.pathname.split("/")[1];
const pagesOwner = parsedBase.hostname.slice(0, -".github.io".length);
if (repositoryOwner.toLowerCase() !== pagesOwner.toLowerCase()) {
  throw new Error("The GitHub Pages host owner must match the GitHub repository owner.");
}

const nsisHome = process.env.NSIS_HOME ?? "C:\\Program Files (x86)\\NSIS";
const makensis = join(nsisHome, "makensis.exe");
const compilerVersion = execFileSync(makensis, ["/VERSION"], { encoding: "utf8" }).trim();
if (compilerVersion !== "v3.13") {
  throw new Error(`NSIS 3.13 is required; found ${compilerVersion || "unknown version"}.`);
}

execFileSync(process.execPath, [join(root, "scripts", "build.mjs")], {
  cwd: root,
  stdio: "inherit",
});

rmSync(stagingDir, { recursive: true, force: true });
mkdirSync(stagingDir, { recursive: true });
cpSync(join(root, "dist"), stagingDir, { recursive: true });

let manifest = readFileSync(join(root, "manifest.xml"), "utf8");
const localUrlCount = (manifest.match(/https:\/\/localhost:3000/g) ?? []).length;
if (localUrlCount === 0) {
  throw new Error("Expected localhost URLs in the development manifest.");
}
manifest = manifest.replaceAll("https://localhost:3000", baseUrl);
manifest = manifest.replaceAll("https://github.com/OWNER/cellwise", repositoryUrl);
if (/https:\/\/localhost:3000|github\.com\/OWNER/.test(manifest)) {
  throw new Error("Generated manifest still contains a placeholder URL.");
}
const generatedManifestPath = join(stagingDir, "manifest.xml");
writeFileSync(generatedManifestPath, manifest, "utf8");
writeFileSync(join(stagingDir, "LICENSE"), readFileSync(join(root, "LICENSE")));
writeFileSync(join(stagingDir, "NOTICE"), readFileSync(join(root, "NOTICE")));
writeFileSync(join(stagingDir, "SUPPORT.md"), readFileSync(join(root, "SUPPORT.md")));
writeFileSync(join(stagingDir, "Remove-Cellwise.ps1"), readFileSync(join(root, "scripts", "Remove-Cellwise.ps1")));
execSync(`npx office-addin-manifest validate "${generatedManifestPath}"`, {
  cwd: root,
  stdio: "inherit",
});

const zipPath = join(releaseDir, `Cellwise-${version}.zip`);
mkdirSync(releaseDir, { recursive: true });
const shell = spawnSync("pwsh", [
  "-NoProfile",
  "-File",
  join(root, "scripts", "zip-package.ps1"),
  "-SourcePath",
  stagingDir,
  "-DestinationPath",
  zipPath,
], { cwd: root, stdio: "inherit" });
if (shell.error?.code === "ENOENT") {
  const fallback = spawnSync("powershell.exe", [
    "-NoProfile",
    "-File",
    join(root, "scripts", "zip-package.ps1"),
    "-SourcePath",
    stagingDir,
    "-DestinationPath",
    zipPath,
  ], { cwd: root, stdio: "inherit" });
  if (fallback.error) throw fallback.error;
  if (fallback.status !== 0) throw new Error(`PowerShell ZIP command failed (${fallback.status}).`);
} else if (shell.error) {
  throw shell.error;
} else if (shell.status !== 0) {
  throw new Error(`PowerShell ZIP command failed (${shell.status}).`);
}

const installerPath = join(releaseDir, `Cellwise-Setup-${version}.exe`);
const args = [
  "/V3",
  `/DPRODUCT_VERSION=${version}`,
  `/DPRODUCT_VERSION_NUMERIC=${version}.0`,
  `/DOUTPUT_FILE=${installerPath}`,
  `/DMANIFEST_FILE=${join(stagingDir, "manifest.xml")}`,
  `/DVERIFY_SCRIPT=${join(root, "scripts", "Verify-Cellwise.ps1")}`,
  `/DLICENSE_FILE=${join(root, "LICENSE")}`,
  `/DNOTICE_FILE=${join(root, "NOTICE")}`,
  `/DREMOVE_SCRIPT=${join(root, "scripts", "Remove-Cellwise.ps1")}`,
  join(root, "installer", "Cellwise.nsi"),
];
execFileSync(makensis, args, { cwd: root, stdio: "inherit" });
console.log(`Created ${zipPath}`);
console.log(`Created ${installerPath}`);
