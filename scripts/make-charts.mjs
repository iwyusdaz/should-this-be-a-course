#!/usr/bin/env node
/**
 * make-charts.mjs — generates the PNG charts for the survey analysis and the baseline
 * dashboard from the SIMULATED survey CSV.
 *
 * SIMULATED DATA constructed for portfolio purposes (see docs/02-discovery/survey-data-readme.md).
 *
 * Method: each chart is built as an accessible inline SVG (text elements, no color-only
 * encoding, values printed on every bar) inside a minimal HTML shell, then captured to
 * PNG with Playwright at deviceScaleFactor 2. Every chart ships in the Markdown pages
 * with alt text carrying the takeaway AND a full data table beside it (WCAG 1.1.1).
 *
 * Usage: node scripts/make-charts.mjs   (writes docs/assets/charts/*.png)
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CSV = resolve(ROOT, "docs/02-discovery/survey-data-simulated.csv");
const OUTDIR = resolve(ROOT, "docs/assets/charts");
const TMP = resolve(ROOT, ".chart-tmp");

// ------------------------------------------------------------------ data
const lines = readFileSync(CSV, "utf8").split("\n").filter((l) => l && !l.startsWith("#"));
const head = lines[0].split(",");
const rows = lines.slice(1).map((l) => Object.fromEntries(l.split(",").map((v, i) => [head[i], v])));
const staff = rows.filter((r) => r.sample === "staff");
const mgrs = rows.filter((r) => r.sample === "manager");
const mean = (xs) => xs.reduce((a, b) => a + Number(b), 0) / xs.length;
const r1 = (x) => Math.round(x * 10) / 10;

const byUseful = (pred) => r1(mean(staff.filter(pred).map((r) => r.likert_feedback_useful)));
const useful = {
  yes1on1: byUseful((r) => r.regular_1on1s === "yes"),
  no1on1: byUseful((r) => r.regular_1on1s === "no"),
  t12: byUseful((r) => r.team_size_band === "12-13"),
  t14: byUseful((r) => r.team_size_band === "14-15"),
  t16: byUseful((r) => r.team_size_band === "16-18"),
  ten1: byUseful((r) => r.manager_tenure_band === "<1 yr"),
  ten2: byUseful((r) => r.manager_tenure_band === "1-5 yrs"),
  ten3: byUseful((r) => r.manager_tenure_band === ">5 yrs"),
  cedar: byUseful((r) => r.clinic === "Cedar Point"),
  other: byUseful((r) => r.clinic !== "Cedar Point"),
};
const cadenceCounts = {};
for (const m of mgrs) cadenceCounts[m.mgr_1on1_cadence] = (cadenceCounts[m.mgr_1on1_cadence] || 0) + 1;
const cedar1on1 = r1(mean(staff.filter((r) => r.clinic === "Cedar Point").map((r) => r.likert_1on1_freq)));
const other1on1 = r1(mean(staff.filter((r) => r.clinic !== "Cedar Point").map((r) => r.likert_1on1_freq)));

// ------------------------------------------------------------------ SVG builders
const INK = "#1a2433"; // near-black text (contrast > 12:1 on white)
const BAR = "#205493"; // dark blue, contrast vs white 8.6:1
const TARGET = "#5e7a96"; // outline color for target bars
const GRID = "#c7cdd4";

function barChart({ labels, values, yMax, unit = "", target = null, height = 300, legendLabels = ["Current (simulated baseline)", "Target"] }) {
  const W = 700, padL = 46, padB = 58, padT = 26, padR = 16;
  const plotW = W - padL - padR, plotH = height - padB - padT;
  const n = labels.length;
  const groupW = plotW / n;
  const barW = target ? groupW * 0.3 : groupW * 0.5;
  const y = (v) => padT + plotH * (1 - v / yMax);
  let g = "";
  // gridlines + y axis labels
  for (let v = 0; v <= yMax; v += yMax / 5) {
    const yy = y(v).toFixed(1);
    g += `<line x1="${padL}" y1="${yy}" x2="${W - padR}" y2="${yy}" stroke="${v === 0 ? INK : GRID}" stroke-width="${v === 0 ? 1.5 : 1}"/>`;
    g += `<text x="${padL - 8}" y="${yy}" text-anchor="end" dominant-baseline="middle" font-size="13" fill="${INK}">${Number.isInteger(v) ? v : r1(v)}</text>`;
  }
  labels.forEach((lab, i) => {
    const cx = padL + groupW * i + groupW / 2;
    const bx = cx - (target ? barW + 4 : barW / 2);
    const v = values[i];
    g += `<rect x="${bx.toFixed(1)}" y="${y(v).toFixed(1)}" width="${barW.toFixed(1)}" height="${(padT + plotH - y(v)).toFixed(1)}" fill="${BAR}" role="img" aria-label="${lab}: ${v}${unit}"/>`;
    g += `<text x="${(bx + barW / 2).toFixed(1)}" y="${(y(v) - 6).toFixed(1)}" text-anchor="middle" font-size="14" font-weight="600" fill="${INK}">${v}${unit}</text>`;
    if (target) {
      const tv = target[i];
      const tx = cx + 4;
      g += `<rect x="${tx.toFixed(1)}" y="${y(tv).toFixed(1)}" width="${barW.toFixed(1)}" height="${(padT + plotH - y(tv)).toFixed(1)}" fill="none" stroke="${TARGET}" stroke-width="2" stroke-dasharray="5 3"/>`;
      g += `<text x="${(tx + barW / 2).toFixed(1)}" y="${(y(tv) - 6).toFixed(1)}" text-anchor="middle" font-size="14" fill="${INK}">${tv}${unit}</text>`;
    }
    // x label (wrap on space if long)
    const parts = String(lab).split(" ");
    if (parts.length > 1 && lab.length > 12) {
      g += `<text x="${cx}" y="${padT + plotH + 20}" text-anchor="middle" font-size="13" fill="${INK}">${parts.slice(0, Math.ceil(parts.length / 2)).join(" ")}</text>`;
      g += `<text x="${cx}" y="${padT + plotH + 38}" text-anchor="middle" font-size="13" fill="${INK}">${parts.slice(Math.ceil(parts.length / 2)).join(" ")}</text>`;
    } else {
      g += `<text x="${cx}" y="${padT + plotH + 20}" text-anchor="middle" font-size="13" fill="${INK}">${lab}</text>`;
    }
  });
  const legend = target
    ? `<rect x="${padL}" y="4" width="12" height="12" fill="${BAR}"/><text x="${padL + 18}" y="14" font-size="13" fill="${INK}">${legendLabels[0]}</text>
       <rect x="${padL + 230}" y="4" width="12" height="12" fill="none" stroke="${TARGET}" stroke-width="2"/><text x="${padL + 248}" y="14" font-size="13" fill="${INK}">${legendLabels[1]}</text>`
    : "";
  return `<svg viewBox="0 0 ${W} ${height}" width="100%" role="img" xmlns="http://www.w3.org/2000/svg" style="font-family:system-ui,sans-serif">${legend}${g}</svg>`;
}

const page = (name, svg) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>${name}</title>
<style>body{margin:0;background:#fff}#c{width:720px;padding:8px;background:#fff}</style></head>
<body><div id="c">${svg}</div></body></html>`;

// ------------------------------------------------------------------ charts
const charts = {
  "usefulness-by-1on1": barChart({
    labels: ["Has a 1:1 at least fortnightly (n=45)", "No regular 1:1 (n=85)"],
    values: [useful.yes1on1, useful.no1on1],
    yMax: 5,
    height: 320,
  }),
  "usefulness-by-team-size": barChart({
    labels: ["Team of 12-13 (n=55)", "Team of 14-15 (n=45)", "Team of 16-18 (n=30)"],
    values: [useful.t12, useful.t14, useful.t16],
    yMax: 5,
    height: 320,
  }),
  "usefulness-by-manager-tenure": barChart({
    labels: ["Manager <1 yr (n=45)", "Manager 1-5 yrs (n=40)", "Manager >5 yrs (n=45)"],
    values: [useful.ten1, useful.ten2, useful.ten3],
    yMax: 5,
    height: 320,
  }),
  "manager-cadence": barChart({
    labels: ["Weekly or more", "Every two weeks", "Monthly", "Rarely", "Never"],
    values: [cadenceCounts["Weekly or more"], cadenceCounts["Every two weeks"], cadenceCounts["Monthly"], cadenceCounts["Rarely"], cadenceCounts["Never"]],
    yMax: 30,
    height: 320,
  }),
  "cedar-point-wrinkle": barChart({
    labels: ["Cedar Point (n=12)", "All other clinics (n=118)"],
    values: [cedar1on1, other1on1],
    target: [useful.cedar, useful.other],
    yMax: 5,
    height: 320,
    legendLabels: ["1:1 frequency (mean, /5)", "Feedback usefulness (mean, /5)"],
  }),
  "baseline-vs-targets": barChart({
    labels: ["Fortnightly+ 1:1 cadence (% of managers)", "Pulse: useful feedback (score /5)", "90-day new-hire turnover (%)"],
    values: [31, 2.4, 22],
    target: [80, 3.5, 15],
    yMax: 100,
    height: 340,
  }),
};

// ------------------------------------------------------------------ render
mkdirSync(OUTDIR, { recursive: true });
rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 760, height: 500 }, deviceScaleFactor: 2 });
const page2 = await ctx.newPage();

for (const [name, svg] of Object.entries(charts)) {
  const htmlPath = resolve(TMP, `${name}.html`);
  writeFileSync(htmlPath, page(name, svg));
  await page2.goto("file://" + htmlPath);
  await page2.locator("#c").screenshot({ path: resolve(OUTDIR, `${name}.png`) });
  console.log(`wrote docs/assets/charts/${name}.png`);
}
await browser.close();
rmSync(TMP, { recursive: true, force: true });

// Print the exact aggregates so the prose pages quote the real numbers.
console.log("\nAggregates used (from CSV):", JSON.stringify({ useful, cadenceCounts, cedar1on1, other1on1 }, null, 1));
