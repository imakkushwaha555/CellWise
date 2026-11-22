// Check per-page metadata and required documentation-site files.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";

const siteDir = new URL("../site/", import.meta.url);
const root = new URL("../", import.meta.url);
const pageFiles = readdirSync(siteDir).filter((name) => name.endsWith(".html")).sort();
assert.equal(pageFiles.length, 5, "The site should have a landing page and four tutorials.");

const titles = new Set();
const descriptions = new Set();
for (const file of pageFiles) {
  const html = readFileSync(new URL(file, siteDir), "utf8");
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const description = html.match(/<meta name="description" content="([^"]+)">/)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1];
  const jsonLd = html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/)?.[1];

  assert.ok(title, `${file} must have a title.`);
  assert.ok(description, `${file} must have a meta description.`);
  assert.ok(canonical, `${file} must have a canonical URL.`);
  assert.ok(html.includes('property="og:title"') && html.includes('property="og:description"'), `${file} must have Open Graph metadata.`);
  assert.ok(html.includes('name="twitter:card"') && html.includes('name="twitter:image"'), `${file} must have Twitter card metadata.`);
  assert.ok(jsonLd, `${file} must have JSON-LD.`);
  assert.equal(JSON.parse(jsonLd)["@type"], "SoftwareApplication", `${file} JSON-LD must describe the application.`);
  assert.ok(html.includes("Not affiliated with or endorsed by Microsoft."), `${file} must include the disclaimer.`);
  assert.ok(!/<img\b(?![^>]*\balt=)[^>]*>/i.test(html), `${file} images must have alt text.`);
  assert.ok(canonical.endsWith(file === "index.html" ? "/" : `/${basename(file)}`), `${file} canonical path must match the page.`);
  assert.ok(!titles.has(title), `${file} title must be unique.`);
  assert.ok(!descriptions.has(description), `${file} description must be unique.`);
  titles.add(title);
  descriptions.add(description);
}

const robots = readFileSync(new URL("robots.txt", siteDir), "utf8");
const sitemap = readFileSync(new URL("sitemap.xml", siteDir), "utf8");
assert.ok(robots.includes("{{BASE_URL}}/sitemap.xml"), "robots.txt must declare the sitemap.");
assert.equal((sitemap.match(/<url>/g) ?? []).length, pageFiles.length, "Sitemap must include every page.");
assert.ok(readFileSync(new URL("style.css", siteDir), "utf8").includes("@media"), "The site stylesheet must include a mobile layout.");
assert.ok(readFileSync(new URL("assets/formula-example.svg", root), "utf8").includes("Illustration only"), "The formula visual must be labeled as an illustration.");

console.log("Pages metadata checks passed.");
