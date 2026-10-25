#!/usr/bin/env node
/**
 * make-job-aid-pdf.mjs — prints docs/05-build/job-aid/index.html to a tagged PDF
 * (docs/05-build/job-aid/job-aid.pdf) using Chromium via Playwright.
 *
 * A tagged PDF preserves heading structure and reading order for screen readers
 * (Playwright's page.pdf({ tagged: true }) uses Chromium's accessibility tree).
 * The HTML is the single source of truth; the print CSS in the page lays it out.
 *
 * Usage: node scripts/make-job-aid-pdf.mjs
 */
import { chromium } from "playwright";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { statSync } from "node:fs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const IN = resolve(ROOT, "docs/05-build/job-aid/index.html");
const OUT = resolve(ROOT, "docs/05-build/job-aid/job-aid.pdf");

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("file://" + IN, { waitUntil: "networkidle" });
await page.emulateMedia({ media: "print" });
await page.pdf({
  path: OUT,
  format: "A4",
  printBackground: true,
  tagged: true,
  margin: { top: "14mm", bottom: "14mm", left: "14mm", right: "14mm" },
});
await browser.close();

const kb = (statSync(OUT).size / 1024).toFixed(0);
console.log(`wrote docs/05-build/job-aid/job-aid.pdf (${kb} kB, tagged)`);
