#!/usr/bin/env node
/*
 * Replaces the placeholder domain in every page at once.
 *   node scripts/set-domain.js https://yourname.dev
 * Changing a domain you already set:
 *   node scripts/set-domain.js https://newname.dev --from https://oldname.dev
 */
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const target = (args[0] || "").replace(/\/+$/, "");
const fromIdx = args.indexOf("--from");
const from = fromIdx > -1 ? args[fromIdx + 1].replace(/\/+$/, "") : "https://YOUR-DOMAIN.example";

if (!/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/[\w./-]*)?$/i.test(target)) {
  console.error("Usage: node scripts/set-domain.js https://yourname.dev");
  console.error("The address must start with https:// and must not contain spaces.");
  process.exit(1);
}

const ROOT = path.resolve(__dirname, "..");
const SKIP = new Set(["node_modules", "scripts", ".git", "fonts"]);
let changedFiles = 0;
let replacements = 0;

(function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) { if (!SKIP.has(name)) walk(full); continue; }
    if (!/\.(html|xml|txt)$/.test(name) || name === "README.md") continue;
    const before = fs.readFileSync(full, "utf8");
    const count = before.split(from).length - 1;
    if (count) {
      fs.writeFileSync(full, before.split(from).join(target));
      changedFiles += 1;
      replacements += count;
      console.log(`  ${path.relative(ROOT, full)}: ${count}`);
    }
  }
})(ROOT);

if (!replacements) {
  console.log(`Nothing to replace: "${from}" was not found. If you already set a domain, use --from.`);
  process.exit(1);
}
console.log(`\nDone: ${replacements} replacement(s) in ${changedFiles} file(s) -> ${target}`);
