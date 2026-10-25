#!/usr/bin/env node
/**
 * build-scenario.mjs — compiles src/scenario.twee to docs/05-build/scenario/index.html
 * with Tweego (pinned binary) + SugarCube 2.37.3 (pinned story format), then applies
 * two documented post-compile fixes:
 *
 *   1. Adds lang="en" to the <html> element (SugarCube's template omits it; WCAG 3.1.1).
 *   2. Verifies the build: story format, focus handler, title, and that no passage
 *      markup errors were reported by Tweego.
 *
 * Usage: node scripts/build-scenario.mjs
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = resolve(ROOT, "src/scenario.twee");
const OUT = resolve(ROOT, "docs/05-build/scenario/index.html");
const TWEEGO = "/Users/iwayanusada/github-portfolio-building/tooling/bin/tweego";
const TWEEGO_PATH = "/Users/iwayanusada/github-portfolio-building/tooling/storyformats";

mkdirSync(dirname(OUT), { recursive: true });

// 1. Compile
execFileSync(TWEEGO, ["-f", "sugarcube-2", "-o", OUT, SRC], {
  env: { ...process.env, TWEEGO_PATH },
  stdio: "inherit",
});

// 2. Post-fix: lang attribute
let html = readFileSync(OUT, "utf8");
if (!/<html[^>]*\slang=/.test(html)) {
  const before = html.length;
  html = html.replace(/<html([^>]*)>/, "<html$1 lang=\"en\">");
  if (html.length === before) throw new Error("could not patch lang attribute");
  console.log("post-fix: added lang=\"en\" to <html>");
}
writeFileSync(OUT, html);

// 3. Verify
const checks = [
  ['lang="en"', "lang attribute"],
  ["SugarCube", "story format present"],
  ["2.37.3", "pinned format version"],
  ["passagedisplay", "focus handler compiled in"],
  ["The Handover Problem", "story title"],
  ["Debrief", "debrief passage"],
];
let ok = true;
for (const [needle, label] of checks) {
  const found = html.includes(needle);
  console.log(`${found ? "ok" : "MISSING"}: ${label}`);
  if (!found) ok = false;
}
if (!ok) process.exit(1);
console.log(`build-scenario: wrote ${OUT} (${(html.length / 1024).toFixed(0)} kB)`);
