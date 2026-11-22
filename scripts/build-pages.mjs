// Build the static documentation site and hosted task-pane payload for GitHub Pages.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = join(root, "site");
const outputDir = join(root, "_site");
const markerPath = join(outputDir, ".cellwise-pages-build");
const baseUrl = process.env.CELLWISE_BASE_URL?.replace(/\/+$/, "");
const repositoryUrl = process.env.CELLWISE_REPOSITORY_URL?.replace(/\/+$/, "");

if (!baseUrl || !repositoryUrl) {
  throw new Error("Set CELLWISE_BASE_URL and CELLWISE_REPOSITORY_URL before building the Pages site.");
}

const base = new URL(baseUrl);
const repository = new URL(repositoryUrl);
if (
  base.protocol !== "https:"
  || base.hostname.toLowerCase() !== `${repository.pathname.split("/")[1]?.toLowerCase()}.github.io`
  || base.pathname.replace(/\/+$/, "") !== "/cellwise"
  || base.search
  || base.hash
) {
  throw new Error(`CELLWISE_BASE_URL must be the HTTPS GitHub Pages URL for the cellwise repository; got: ${baseUrl}`);
}
if (
  repository.protocol !== "https:"
  || repository.hostname !== "github.com"
  || !/^\/[^/]+\/cellwise$/.test(repository.pathname)
  || repository.search
  || repository.hash
) {
  throw new Error(`CELLWISE_REPOSITORY_URL must be the HTTPS GitHub cellwise repository URL; got: ${repositoryUrl}`);
}

const distDir = join(root, "dist");
for (const path of ["taskpane.html", "taskpane.js", "icon-16.png", "icon-32.png", "icon-80.png"]) {
  if (!existsSync(join(distDir, path))) {
    throw new Error(`Missing add-in build output: dist/${path}. Run npm run build first.`);
  }
}

if (existsSync(outputDir)) {
  if (!existsSync(markerPath) || readFileSync(markerPath, "utf8") !== "Cellwise generated Pages output\n") {
    throw new Error("Refusing to replace _site because it is not marked as Cellwise-generated output.");
  }
  rmSync(outputDir, { recursive: true });
}

mkdirSync(outputDir, { recursive: true });
cpSync(sourceDir, outputDir, { recursive: true });
cpSync(join(root, "assets"), join(outputDir, "assets"), { recursive: true });
cpSync(distDir, outputDir, { recursive: true });

function replaceTokens(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      replaceTokens(path);
    } else if (/\.(html|xml|txt)$/.test(entry.name)) {
      const source = readFileSync(path, "utf8");
      const generated = source
        .replaceAll("{{BASE_URL}}", baseUrl)
        .replaceAll("{{REPOSITORY_URL}}", repositoryUrl);
      if (/\{\{(?:BASE_URL|REPOSITORY_URL)\}\}/.test(generated)) {
        throw new Error(`Unresolved URL placeholder in ${relative(outputDir, path)}.`);
      }
      writeFileSync(path, generated, "utf8");
    }
  }
}

replaceTokens(outputDir);
writeFileSync(markerPath, "Cellwise generated Pages output\n", "utf8");
writeFileSync(join(outputDir, ".nojekyll"), "", "utf8");
console.log(`Built Pages site at ${outputDir}`);
