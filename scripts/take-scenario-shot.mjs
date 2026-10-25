#!/usr/bin/env node
// One-off: capture the scenario opening passage as the README hero image
// (docs/assets/scenario-preview.png). Playwright 1.57.0 from the workspace root.
import { chromium } from "playwright";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
await page.goto("file://" + resolve(ROOT, "docs/05-build/scenario/index.html"));
await page.waitForFunction(() => !!document.querySelector("#passages .passage h2"), null, { timeout: 15000 });
await page.waitForTimeout(600); // let fonts/focus settle
await page.screenshot({ path: resolve(ROOT, "docs/assets/scenario-preview.png") });
await browser.close();
console.log("wrote docs/assets/scenario-preview.png");
