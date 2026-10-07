#!/usr/bin/env node
/*
 * Pre-deploy checker. Run:  node scripts/check.js
 * Finds everything you still have to finish, so no placeholder reaches the internet:
 *   - TODO(you) comments, YOUR-... / YOUR_... values, example.com, data-todo cards
 *   - missing files (photo, resume)
 *   - broken local links and image paths
 *   - images that are too heavy for a fast site
 * Exit code 1 means "not ready", 0 means "ready to deploy".
 * Needs only Node.js 18+. No installs.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SKIP_DIRS = new Set(["node_modules", "scripts", ".git", "fonts"]);
const TEMPLATE_RE = /-template\.html$/;
const PAGE_EXT = new Set([".html", ".xml", ".txt"]);

const PLACEHOLDERS = [
  [/TODO\(you\)/, "TODO(you) still in file"],
  [/YOUR-[A-Z0-9-]+|YOUR_[A-Z0-9_]+/, "placeholder value (YOUR-...)"],
  [/example\.com/, "example.com placeholder"],
  [/\bdata-todo\b/, "project card not finished (remove data-todo)"],
];
const REQUIRED_FILES = [
  ["images/profile.jpg", "profile photo (square, ~600x600)"],
  ["assets/Abhishek-Asati-Resume.pdf", "resume PDF"],
];
const MAX_IMAGE_KB = 200;

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (!SKIP_DIRS.has(name)) walk(full, out);
    } else out.push(full);
  }
  return out;
}
const rel = (f) => path.relative(ROOT, f).split(path.sep).join("/");

const files = walk(ROOT);
const pages = files.filter((f) => PAGE_EXT.has(path.extname(f)) && !/^README/i.test(path.basename(f)));
const problems = [];
const ignoredTemplates = [];

for (const file of pages) {
  if (TEMPLATE_RE.test(file)) { ignoredTemplates.push(rel(file)); continue; }
  const lines = fs.readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const [re, label] of PLACEHOLDERS) {
      if (re.test(line)) problems.push(`${rel(file)}:${i + 1}  ${label}\n      ${line.trim().slice(0, 110)}`);
    }
  });
}

for (const [file, label] of REQUIRED_FILES) {
  if (!fs.existsSync(path.join(ROOT, file))) problems.push(`${file}  missing: ${label}`);
}

// Broken local links / images
const ATTR_RE = /\b(?:href|src)="([^"]+)"/g;
for (const file of pages.filter((f) => f.endsWith(".html"))) {
  const html = fs.readFileSync(file, "utf8").replace(/<!--[\s\S]*?-->/g, "");
  let m;
  while ((m = ATTR_RE.exec(html))) {
    const url = m[1];
    if (/^(https?:|mailto:|tel:|data:|#|javascript:)/i.test(url)) continue;
    const clean = url.split("#")[0].split("?")[0];
    if (!clean) continue;
    const target = clean.startsWith("/") ? path.join(ROOT, clean) : path.resolve(path.dirname(file), clean);
    if (!fs.existsSync(target) && !fs.existsSync(path.join(target, "index.html"))) {
      // profile.jpg and the resume are reported once above, not again here
      if (REQUIRED_FILES.some(([f]) => path.join(ROOT, f) === target)) continue;
      problems.push(`${rel(file)}  broken link or image: ${url}`);
    }
  }
}

// Image weight
for (const file of files.filter((f) => /\.(png|jpe?g|webp|gif|avif)$/i.test(f))) {
  const kb = Math.round(fs.statSync(file).size / 1024);
  if (kb > MAX_IMAGE_KB && !rel(file).endsWith("og-image.png")) {
    problems.push(`${rel(file)}  ${kb} KB is heavy. Export WebP under ${MAX_IMAGE_KB} KB (squoosh.app is free).`);
  }
}

if (ignoredTemplates.length) {
  console.log("Templates skipped (copy them to make real pages):\n  " + ignoredTemplates.join("\n  ") + "\n");
}
if (problems.length) {
  console.log(`NOT READY: ${problems.length} thing(s) left to finish\n`);
  problems.forEach((p) => console.log(" - " + p));
  console.log("\nFix them, then run:  node scripts/check.js");
  process.exit(1);
}
console.log("READY: no placeholders, no broken links, images are light. Deploy it.");
