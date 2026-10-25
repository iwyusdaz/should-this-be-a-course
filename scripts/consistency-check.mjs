#!/usr/bin/env node
/**
 * consistency-check.mjs — pre-publish consistency gate for the case's locked numbers.
 *
 * Verifies that the three locked baseline values appear consistently across the
 * artifacts that must agree (per the case plan's "consistency check before publishing"):
 *   - 22% 90-day turnover   (intake, analysis, dashboard, measurement plan, README)
 *   - 31% fortnightly+ one-on-one rate (intake, survey analysis, dashboard, measurement plan)
 *   - 2.4/5 pulse score     (intake, survey analysis/CSV, dashboard, measurement plan)
 *   - supporting locked facts: 12-18 direct reports, 70 managers, 900 staff, 35% new managers
 *   - the CSV actually produces those values (re-runs the generator's --verify)
 *
 * Usage: node scripts/consistency-check.mjs   (exit 1 on any inconsistency)
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(resolve(ROOT, p), "utf8");

let failures = 0;
function expectIn(file, patterns, label) {
  const text = read(file);
  for (const [needle, desc] of patterns) {
    if (!text.includes(needle)) {
      console.log(`MISSING in ${file}: ${desc} (${needle})`);
      failures++;
    }
  }
  console.log(`ok: ${label} — ${file}`);
}

// 22% turnover
expectIn(
  "docs/01-intake/intake-form-completed.md",
  [["22%", "turnover 22%"], ["15%", "target 15%"], ["17 of 78", "HRIS counts"]],
  "turnover"
);
expectIn("docs/03-analysis/performance-gap.md", [["22%"], ["15%"], ["17 of 78"]], "turnover");
expectIn("docs/06-measure/baseline-dashboard.md", [["22%", "turnover 22%"], ["17 of 78", "counts"], ["21.8%", "trailing rate"]], "turnover");
expectIn("docs/06-measure/measurement-plan.md", [["22%", "turnover 22%"], ["15%"]], "turnover");
expectIn("README.md", [["22%", "turnover 22%"], ["15%"]], "turnover");

// 31% cadence
expectIn(
  "docs/02-discovery/survey-analysis.md",
  [["31%", "cadence 31%"], ["22 of 70", "22 of 70 managers"]],
  "cadence"
);
expectIn("docs/03-analysis/performance-gap.md", [["31%", "cadence 31%"], ["22 of 70", "22 of 70"], ["80%"]], "cadence");
expectIn("docs/06-measure/baseline-dashboard.md", [["31%", "cadence 31%"], ["22", "count 22 of 70"]], "cadence");
expectIn("docs/06-measure/measurement-plan.md", [["31%", "cadence 31%"], ["22 of 70", "22 of 70"], ["80%"]], "cadence");
expectIn("docs/01-intake/intake-form-completed.md", [["31%", "cadence 31%"]], "cadence");

// 2.4/5 pulse
expectIn("docs/02-discovery/survey-analysis.md", [["2.4/5", "pulse 2.4/5"]], "pulse");
expectIn("docs/06-measure/baseline-dashboard.md", [["2.4", "pulse 2.4"], ["3.5", "target 3.5"]], "pulse");
expectIn("docs/06-measure/measurement-plan.md", [["2.4/5", "pulse 2.4/5"], ["3.5/5", "target"]], "pulse");
expectIn("docs/03-analysis/performance-gap.md", [["2.4/5", "pulse 2.4/5"]], "pulse");

// supporting locked facts everywhere they are claimed
expectIn("docs/01-intake/intake-form-completed.md", [["900 staff", "900 staff"], ["70 people managers", "70 managers"], ["35%", "35% new managers"]], "case facts");
expectIn("docs/02-discovery/document-review.md", [["12–18", "spans 12-18"], ["13 direct reports", "median 13 direct reports"], ["35%", "35% new managers"]], "case facts");
expectIn("docs/04-solution/stakeholder-proposal.md", [["22%", "turnover 22%"], ["31%", "cadence 31%"], ["12–18", "spans"]], "case facts");
expectIn("README.md", [["12–18", "spans"], ["70 people managers", "managers"], ["2.4/5", "pulse"], ["31%", "cadence"]], "case facts");

// gap statement consistency (1 in 5 / ~20% structured feedback)
expectIn("docs/03-analysis/performance-gap.md", [["1 in 5", "1 in 5 structured feedback"], ["4 in 5", "target 4 in 5"]], "gap statement");
expectIn("docs/06-measure/baseline-dashboard.md", [["1 in 5", "1 in 5 structured feedback"]], "gap statement");

// the CSV must regenerate with the locked values
console.log("verifying CSV generator against locked values…");
execFileSync("node", [resolve(ROOT, "scripts/generate-survey.mjs"), "--verify"], { stdio: "inherit" });

// and the CSV on disk must match a fresh regeneration (byte-identical seed)
const csvOnDisk = read("docs/02-discovery/survey-data-simulated.csv");
execFileSync("node", [resolve(ROOT, "scripts/generate-survey.mjs")], { stdio: "ignore" });
if (read("docs/02-discovery/survey-data-simulated.csv") !== csvOnDisk) {
  console.log("CSV ON DISK DOES NOT MATCH FRESH REGENERATION");
  failures++;
} else {
  console.log("ok: CSV on disk is byte-identical to a fresh seeded regeneration");
}

// pulse mean straight from the committed CSV
const rows = csvOnDisk.split("\n").filter((l) => l && !l.startsWith("#"));
const head = rows[0].split(",");
const data = rows.slice(1).map((l) => Object.fromEntries(l.split(",").map((v, i) => [head[i], v])));
const staff = data.filter((r) => r.sample === "staff");
const useful = staff.map((r) => Number(r.likert_feedback_useful));
const pulseMean = useful.reduce((a, b) => a + b, 0) / useful.length;
const biweekly = data.filter((r) => r.sample === "manager" && ["Weekly or more", "Every two weeks"].includes(r.mgr_1on1_cadence)).length;
console.log(`CSV check: pulse mean ${(Math.round(pulseMean * 100) / 100).toFixed(2)} (target 2.40), biweekly+ managers ${biweekly}/70 (target 22 = 31%), rows ${data.length} (target 200)`);
if (Math.round(pulseMean * 100) !== 240 || biweekly !== 22 || data.length !== 200) failures++;

if (failures) {
  console.log(`\nCONSISTENCY CHECK FAILED: ${failures} problem(s)`);
  process.exit(1);
}
console.log("\nCONSISTENCY CHECK PASSED: 22% turnover, 31% cadence, 2.4/5 pulse and the supporting case facts agree across intake, CSV, analysis, dashboard, measurement plan and README.");
