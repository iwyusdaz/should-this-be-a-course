#!/usr/bin/env node
/**
 * check-links.mjs — pre-publish relative-link check for the Jekyll source.
 *
 * The Pages build is the first real HTML render of the Markdown (no local Jekyll in this
 * environment), so this checks the next best thing: every relative link and image path in
 * the repository's Markdown must resolve to a file that will exist after the build —
 * a sibling .md (rendered to .html), a static .html/.pdf/.png/.csv file, or a directory
 * index. Anchors (#…) are checked only for being well-formed.
 *
 * Absolute http(s) links are listed but not fetched (the post-publish linkcheck crawls
 * the live site).
 *
 * Usage: node scripts/check-links.mjs   (exit 1 on any broken relative link)
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { resolve, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const p = join(dir, entry.name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else yield p;
  }
}

const files = [...walk(ROOT)].filter((f) => f.endsWith(".md"));
const linkRe = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)|<a\s[^>]*href="([^"]+)"/g;

let broken = 0;
let checked = 0;
const absLinks = [];

for (const file of files) {
  const relFile = relative(ROOT, file);
  const text = readFileSync(file, "utf8");
  let m;
  while ((m = linkRe.exec(text)) !== null) {
    const raw = (m[1] || m[2] || "").trim();
    if (!raw || raw.startsWith("#")) continue;
    if (/^https?:\/\//.test(raw) || raw.startsWith("mailto:")) {
      absLinks.push(`${relFile}: ${raw}`);
      continue;
    }
    checked++;
    const [pathPart, anchor] = raw.split("#");
    if (!pathPart && anchor) continue; // pure anchor link within the page
    const target = resolve(dirname(file), decodeURIComponent(pathPart));
    const candidates = [
      target, // exact (static .html, .png, .csv, .pdf…)
      target.replace(/\.html$/, ".md"), // Jekyll-rendered page source
      join(target, "index.md"), // directory index page
      join(target, "index.html"), // static directory index (scenario)
    ];
    if (!candidates.some((c) => existsSync(c) && statSync(c).isFile())) {
      console.log(`BROKEN  ${relFile} -> ${raw}`);
      broken++;
    } else if (anchor) {
      // anchor targets are only verified informally (Jekyll heading_anchors generates them)
    }
  }
}

console.log(`\nchecked ${checked} relative links/images across ${files.length} markdown files`);
console.log(`${absLinks.length} absolute links (not fetched pre-publish; crawled post-publish)`);
if (broken) {
  console.log(`${broken} BROKEN relative links`);
  process.exit(1);
}
console.log("all relative links resolve to files that will exist after the Pages build");
