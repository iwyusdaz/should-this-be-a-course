#!/usr/bin/env node
/**
 * generate-survey.mjs — reproducible generator for the SIMULATED Brightline pulse survey.
 *
 * SIMULATED DATA constructed for portfolio purposes. Brightline Health Services is a
 * fictional organization. This script fabricates a survey dataset whose patterns were
 * designed during the discovery phase of the case study (see
 * docs/02-discovery/survey-data-readme.md). It does not describe any real organization
 * or real respondents.
 *
 * Output: docs/02-discovery/survey-data-simulated.csv  (n = 200: 130 staff + 70 managers)
 *
 * Method (documented in full in the survey data README):
 *  - Deterministic PRNG (mulberry32, seed 20261025) so the file is byte-identical on
 *    every run. No Math.random anywhere.
 *  - Each respondent row is assigned a group profile (clinic, team size band, manager
 *    tenure band, regular one-on-ones...).
 *  - Likert items are assigned by "sorted assignment": rows are ordered by a designed
 *    propensity score (e.g., staff with regular one-on-ones and small teams rank higher
 *    on feedback usefulness), then the exact calibrated marginal counts are poured over
 *    the sorted rows. This guarantees (a) the designed correlations and (b) exact
 *    baseline values for the case study (pulse item mean 2.4/5; 22/70 managers at a
 *    fortnightly-or-better cadence = 31%).
 *  - Two designed wrinkles, per the case plan: Cedar Point clinic scores LOW on
 *    usefulness despite frequent one-on-ones (meetings happen, structure doesn't), and
 *    one new manager (Glenrose) scores HIGH (the "experience isn't the variable" outlier).
 *
 * Usage: node scripts/generate-survey.mjs [--verify]
 *   --verify  recomputes summary statistics and fails (exit 1) if the locked baseline
 *             numbers do not hold. Used by the pre-publish consistency check.
 */

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "docs/02-discovery/survey-data-simulated.csv");

// ---------------------------------------------------------------- PRNG (deterministic)
const SEED = 20261025;
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(SEED);

// ---------------------------------------------------------------- design constants
const CLINICS_STAFF = [
  ["Harborview", 14], ["Fairhaven", 13], ["Kestrel", 13], ["Birchwood", 12],
  ["Cedar Point", 12], ["Dockside", 12], ["Glenrose", 11], ["Ashford", 10],
  ["Elm Grove", 10], ["Harborgate", 9], ["Ironwood", 7], ["Longmeadow", 7],
]; // sums to 130
const CLINICS_MGR = [
  ["Harborview", 7], ["Fairhaven", 7], ["Kestrel", 6], ["Birchwood", 6],
  ["Dockside", 6], ["Glenrose", 6], ["Ashford", 6], ["Longmeadow", 6],
  ["Cedar Point", 5], ["Elm Grove", 5], ["Harborgate", 5], ["Ironwood", 5],
]; // sums to 70

const STAFF_ROLES = [["Registered Nurse", 55], ["Medical Assistant", 30], ["Front Desk", 18], ["Allied Health", 15], ["Clinic Admin", 12]];
const STAFF_TENURE = [["<1 yr", 22], ["1-3 yrs", 38], ["3-10 yrs", 40], [">10 yrs", 30]];
const STAFF_TEAM_BANDS = [["12-13", 55], ["14-15", 45], ["16-18", 30]];
const MGR_TENURE = [["<1 yr", 25], ["1-5 yrs", 20], [">5 yrs", 25]];
const MGR_TEAM_BANDS = [["12-13", 32], ["14-15", 22], ["16-18", 16]];

// Calibrated marginals (counts per Likert value 1..5)
const MARGINAL = {
  staff_1on1: [48, 27, 10, 30, 15],        // sum 130; 45 rows report fortnightly+
  staff_feedback_useful: [37, 39, 27, 19, 8], // sum 130; mean = 312/130 = 2.40 (pulse baseline)
  staff_feedback_freq: [44, 41, 24, 14, 7],
  staff_workload: [8, 22, 46, 37, 17],
};

// Manager cadence multiset: 6 weekly + 16 fortnightly = 22 of 70 = 31% (locked baseline)
const MGR_CADENCE = [
  ["Weekly or more", 6], ["Every two weeks", 16], ["Monthly", 26], ["Rarely", 16], ["Never", 6],
];
// Manager "% of 1:1s containing structured feedback" multiset (mean 20.4 = "about 1 in 5")
const MGR_PCT = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
  15, 15, 15, 15, 15, 15, 15, 15, 15, 20, 20, 20, 20, 20, 20, 20, 20, 25, 25, 25, 25, 25, 25, 25,
  30, 30, 30, 30, 30, 30, 40, 40, 40, 40, 40, 50, 50, 50, 50, 75, 75, 100];

// ---------------------------------------------------------------- helpers
function expandPairs(pairs) {
  const out = [];
  for (const [value, n] of pairs) for (let i = 0; i < n; i++) out.push(value);
  return out;
}
function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
/** Sorted assignment: order rows by propensity, pour the marginal counts over them. */
function assignByPropensity(rows, propensity, marginal) {
  const order = rows
    .map((r, i) => ({ i, p: propensity(r) + (rand() - 0.5) * 0.5 })) // jitter keeps ties from looking mechanical
    .sort((a, b) => a.p - b.p);
  let k = 0;
  for (let value = 1; value <= 5; value++) {
    for (let c = 0; c < marginal[value - 1]; c++) rows[order[k++].i].value = value;
  }
  return rows;
}

// ---------------------------------------------------------------- build staff rows (130)
const staff = [];
{
  const clinics = shuffled(expandPairs(CLINICS_STAFF));
  const roles = shuffled(expandPairs(STAFF_ROLES));
  const tenure = shuffled(expandPairs(STAFF_TENURE));
  const teams = shuffled(expandPairs(STAFF_TEAM_BANDS));
  // Exactly 45 of 130 staff report a one-on-one at least every two weeks (~35%, which
  // tracks the manager-level 31% with sampling noise). All 12 Cedar Point staff report
  // frequent 1:1s (the designed wrinkle), so 33 non-Cedar rows are "yes".
  const cedarCount = CLINICS_STAFF.find(([c]) => c === "Cedar Point")[1];
  const yesNonCedar = 45 - cedarCount;
  const otherClinics = CLINICS_STAFF.filter(([c]) => c !== "Cedar Point").map(([c]) => c);
  const oneOnOne = shuffled([
    ...Array(yesNonCedar).fill("yes"),
    ...Array(130 - 45).fill("no"),
  ]);
  // Stitch back together in clinic order, forcing Cedar Point rows to "yes"
  {
    const fixed = [];
    let k = 0;
    for (let i = 0; i < 130; i++) {
      fixed.push(clinics[i] === "Cedar Point" ? "yes" : oneOnOne[k++]);
    }
    oneOnOne.splice(0, oneOnOne.length, ...fixed);
  }

  for (let i = 0; i < 130; i++) {
    staff.push({
      id: `S${String(i + 1).padStart(3, "0")}`,
      sample: "staff",
      clinic: clinics[i],
      role: roles[i],
      tenure_band: tenure[i],
      manager_tenure_band: "", // filled below: staff inherit their manager cohort mix
      team_size_band: teams[i],
      regular_1on1s: oneOnOne[i],
      likert_1on1_freq: 0,
      likert_feedback_freq: 0,
      likert_feedback_useful: 0,
      likert_workload: 0,
      mgr_1on1_cadence: "",
      mgr_pct_1on1s_structured_feedback: "",
      _cedar: clinics[i] === "Cedar Point",
    });
  }
  // Manager tenure as seen by staff: ~35% report to <1 yr managers (expansion cohort)
  const mTenure = shuffled([...Array(45).fill("<1 yr"), ...Array(40).fill("1-5 yrs"), ...Array(45).fill(">5 yrs")]);
  staff.forEach((r, i) => { r.manager_tenure_band = mTenure[i]; });

  // Propensities (designed correlations; manager tenure deliberately weak)
  const p1on1 = (r) => (r.regular_1on1s === "yes" ? 2.0 : 0);
  assignByPropensity(staff, (r) => p1on1(r), MARGINAL.staff_1on1)
    .forEach((r) => (r.likert_1on1_freq = r.value));

  assignByPropensity(
    staff,
    (r) =>
      p1on1(r) * 1.2 +
      (r.team_size_band === "12-13" ? 0.9 : r.team_size_band === "14-15" ? 0.45 : 0) +
      (r.manager_tenure_band === ">5 yrs" ? 0.35 : r.manager_tenure_band === "1-5 yrs" ? 0.15 : 0) -
      (r._cedar ? 2.6 : 0), // the wrinkle: frequent meetings, no useful feedback
    MARGINAL.staff_feedback_useful
  ).forEach((r) => (r.likert_feedback_useful = r.value));

  assignByPropensity(staff, (r) => r.likert_1on1_freq * 1.0 + p1on1(r) * 0.4, MARGINAL.staff_feedback_freq)
    .forEach((r) => (r.likert_feedback_freq = r.value));

  assignByPropensity(
    staff,
    (r) =>
      (r.team_size_band === "16-18" ? 1.0 : r.team_size_band === "14-15" ? 0.5 : 0) +
      (r.role === "Registered Nurse" ? 0.3 : 0),
    MARGINAL.staff_workload
  ).forEach((r) => (r.likert_workload = r.value));
}

// ---------------------------------------------------------------- build manager rows (70)
const mgrs = [];
{
  const clinics = shuffled(expandPairs(CLINICS_MGR));
  const tenure = shuffled(expandPairs(MGR_TENURE));
  const teams = shuffled(expandPairs(MGR_TEAM_BANDS));
  const pct = shuffled(MGR_PCT);

  for (let i = 0; i < 70; i++) {
    mgrs.push({
      id: `M${String(i + 1).padStart(3, "0")}`,
      sample: "manager",
      clinic: clinics[i],
      role: "People Manager",
      tenure_band: "",
      manager_tenure_band: tenure[i],
      team_size_band: teams[i],
      regular_1on1s: "",
      likert_1on1_freq: "",
      likert_feedback_freq: "",
      likert_feedback_useful: "",
      likert_workload: "",
      mgr_1on1_cadence: "",
      mgr_pct_1on1s_structured_feedback: pct[i],
      _cedar: clinics[i] === "Cedar Point",
    });
  }

  // Cadence is assigned exactly, not shuffled, so the locked baseline holds:
  //   - all 5 Cedar Point managers meet weekly (the wrinkle: frequent meetings, little structure)
  //   - the 64 remaining rows carry [1 weekly, 15 fortnightly, 26 monthly, 16 rarely, 6 never]
  //   => 6 weekly + 16 fortnightly = 22 of 70 managers (31%) at a fortnightly-or-better cadence
  const otherRows = mgrs.filter((r) => !r._cedar);
  const outlier = otherRows.find((r) => r.clinic === "Glenrose" && r.manager_tenure_band === "<1 yr");
  const rest = otherRows.filter((r) => r !== outlier);
  const cadenceRest = shuffled([
    ...Array(1).fill("Weekly or more"),
    ...Array(15).fill("Every two weeks"),
    ...Array(26).fill("Monthly"),
    ...Array(16).fill("Rarely"),
    ...Array(6).fill("Never"),
  ]);
  for (const r of mgrs) if (r._cedar) r.mgr_1on1_cadence = "Weekly or more";
  if (outlier) outlier.mgr_1on1_cadence = "Every two weeks";
  rest.forEach((r, i) => (r.mgr_1on1_cadence = cadenceRest[i]));
  // The "doesn't fit" outlier: a brand-new manager doing it well
  if (outlier) outlier.mgr_pct_1on1s_structured_feedback = 55;
  // Cedar Point's structured-feedback share stays low despite the weekly meetings
  for (const r of mgrs) if (r._cedar) r.mgr_pct_1on1s_structured_feedback = Math.min(r.mgr_pct_1on1s_structured_feedback, 15);
}

// ---------------------------------------------------------------- write CSV
const HEADER = [
  "respondent_id", "sample", "clinic", "role", "tenure_band", "manager_tenure_band",
  "team_size_band", "regular_1on1s", "likert_1on1_freq", "likert_feedback_freq",
  "likert_feedback_useful", "likert_workload", "mgr_1on1_cadence",
  "mgr_pct_1on1s_structured_feedback",
];
const rows = [...staff, ...mgrs];
const csv = [
  "# SIMULATED DATA constructed for portfolio purposes. Brightline Health Services is fictional.",
  "# Generated by scripts/generate-survey.mjs (seed 20261025). Column dictionary:",
  "# docs/02-discovery/survey-data-readme.md",
  HEADER.join(","),
  ...rows.map((r) =>
    HEADER.map((h) => {
      const v = r[h];
      return typeof v === "string" && v.includes(",") ? `"${v}"` : String(v);
    }).join(",")
  ),
].join("\n") + "\n";

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, csv);

// ---------------------------------------------------------------- verify + summarize
function mean(xs) { return xs.reduce((a, b) => a + b, 0) / xs.length; }
const staffUseful = staff.map((r) => r.likert_feedback_useful);
const biweekly = mgrs.filter((r) => ["Weekly or more", "Every two weeks"].includes(r.mgr_1on1_cadence));
const pctMean = mean(mgrs.map((r) => r.mgr_pct_1on1s_structured_feedback));

const groupMean = (pred) => {
  const g = staff.filter(pred).map((r) => r.likert_feedback_useful);
  return { n: g.length, mean: mean(g) };
};
const by = (key) => {
  const out = {};
  for (const r of staff) (out[r[key]] ??= []).push(r.likert_feedback_useful);
  return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, { n: v.length, mean: mean(v) }]));
};

const summary = {
  rows: rows.length,
  staff_rows: staff.length,
  manager_rows: mgrs.length,
  pulse_useful_feedback_mean: Number(mean(staffUseful).toFixed(2)),
  managers_biweekly_or_more: biweekly.length,
  managers_biweekly_or_more_pct: Number(((biweekly.length / 70) * 100).toFixed(1)),
  mgr_structured_feedback_pct_mean: Number(pctMean.toFixed(1)),
  usefulness_by_team_size: by("team_size_band"),
  usefulness_by_1on1: {
    yes: groupMean((r) => r.regular_1on1s === "yes"),
    no: groupMean((r) => r.regular_1on1s === "no"),
  },
  usefulness_by_manager_tenure: by("manager_tenure_band"),
  usefulness_cedar_point: groupMean((r) => r._cedar),
};

console.log(JSON.stringify(summary, null, 2));

if (process.argv.includes("--verify")) {
  const fail = [];
  if (Math.round(mean(staffUseful) * 100) / 100 !== 2.4) fail.push(`pulse mean ${mean(staffUseful).toFixed(3)} != 2.40`);
  if (biweekly.length !== 22) fail.push(`biweekly+ managers ${biweekly.length} != 22 (31%)`);
  if (Math.abs(pctMean - 20.4) > 1.0) fail.push(`structured feedback mean ${pctMean.toFixed(1)} not ~20%`);
  if (rows.length !== 200) fail.push(`rows ${rows.length} != 200`);
  if (fail.length) { console.error("VERIFY FAILED: " + fail.join("; ")); process.exit(1); }
  console.log("VERIFY OK: locked baseline values hold (pulse 2.40/5; 22/70 managers = 31%; structured feedback ~1 in 5; 200 rows).");
}
