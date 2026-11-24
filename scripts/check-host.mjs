// Verify the public static host has the add-in files needed by Word before release packaging.
const baseUrl = process.env.CELLWISE_BASE_URL?.replace(/\/+$/, "");
if (!baseUrl) {
  throw new Error("CELLWISE_BASE_URL must be set to the deployed HTTPS host.");
}

const parsedBase = new URL(baseUrl);
if (parsedBase.protocol !== "https:" || !parsedBase.hostname.endsWith(".github.io")) {
  throw new Error(`Expected an HTTPS GitHub Pages URL; found ${baseUrl}.`);
}

const requiredFiles = [
  "taskpane.html",
  "taskpane.js",
  "icon-32.png",
  "icon-80.png",
];
const results = await Promise.all(requiredFiles.map(async (file) => {
  const url = new URL(file, `${baseUrl}/`);
  const response = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(15000) });
  if (!response.ok) {
    throw new Error(`Hosted add-in file returned HTTP ${response.status}: ${url}`);
  }
  return url.href;
}));

console.log(`Hosted add-in check passed:\n${results.join("\n")}`);
