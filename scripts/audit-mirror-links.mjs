import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("public/paces-mirror");
const files = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(entryPath);
    else if (entry.name.endsWith(".html")) files.push(entryPath);
  }
}

await walk(root);

const hostCounts = new Map();
const ownedUrls = [];
const localPaths = new Map();
const ownedHosts = new Set([
  "paces.com",
  "www.paces.com",
  "paces-stg.webflow.io",
  "paces.webflow.io",
  "app.paces.ai",
]);

for (const file of files) {
  const html = await readFile(file, "utf8");
  for (const match of html.matchAll(/(?:href|action)=["']([^"']+)["']/gi)) {
    try {
      const url = new URL(match[1], "https://local.invalid");
      if (url.hostname === "local.invalid" && url.pathname && !url.pathname.startsWith("/paces-assets/") && !url.pathname.startsWith("/_next/")) {
        const filesForPath = localPaths.get(url.pathname) || new Set();
        filesForPath.add(path.relative(root, file));
        localPaths.set(url.pathname, filesForPath);
      }
      if (!/^https?:$/.test(url.protocol) || url.hostname === "local.invalid") continue;
      hostCounts.set(url.hostname, (hostCounts.get(url.hostname) || 0) + 1);
      if (ownedHosts.has(url.hostname)) {
        ownedUrls.push({ file: path.relative(root, file), attribute: match[1] });
      }
    } catch {
      // Ignore malformed third-party markup.
    }
  }
}

const manifest = JSON.parse(await readFile(path.join(root, "manifest.json"), "utf8"));
const knownRoutes = new Set(["/", "/contact", "/login", ...manifest.routes]);
const missingRoutes = [...localPaths]
  .filter(([route]) => !knownRoutes.has(route) && !path.extname(route))
  .map(([route, sourceFiles]) => ({ route, sourceFiles: [...sourceFiles] }))
  .sort((a, b) => a.route.localeCompare(b.route));

console.log(`Scanned ${files.length} mirrored HTML pages.`);
console.log("External href/action hosts:");
for (const [host, count] of [...hostCounts].sort((a, b) => b[1] - a[1])) {
  console.log(`${String(count).padStart(5)}  ${host}`);
}

if (ownedUrls.length) {
  console.error(`\nFound ${ownedUrls.length} Paces-owned external href/action URLs:`);
  for (const item of ownedUrls.slice(0, 50)) console.error(`${item.file}: ${item.attribute}`);
  process.exitCode = 1;
} else {
  console.log("\nPaces-owned external href/action URLs: 0");
}

if (missingRoutes.length) {
  console.error(`\nFound ${missingRoutes.length} local links without mirrored routes:`);
  for (const item of missingRoutes) console.error(`${item.route} (${item.sourceFiles.slice(0, 3).join(", ")})`);
  process.exitCode = 1;
} else {
  console.log("Local links without mirrored routes: 0");
}
