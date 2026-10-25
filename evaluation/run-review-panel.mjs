#!/usr/bin/env node
/**
 * run-review-panel.mjs — PENDING pipeline: multi-model structured review panel.
 * (See evaluation/METHODS.md for the full method, prompts and limits.)
 *
 * What it does (real run):
 *   - Assembles the review corpus from the actual repository artifacts (proposal,
 *     action map, analysis, measurement plan, scenario design + Twee source, etc.).
 *   - Three reviewer roles (from the structured review form):
 *       R1 learning design · R2 performance consulting & measurement ·
 *       R3 accessibility & clarity
 *   - Requires at least TWO models (MODEL_A, MODEL_B; MODEL_C optional). Every model
 *     reviews every role, so agreement can be computed per role across models.
 *   - Each review answers the form's fixed rubric (pass / concern / fail) plus open
 *     findings as JSON.
 *   - Reports per-item agreement (% identical ratings) and Cohen's kappa across models,
 *     then regenerates evaluation/results.md.
 *
 * A model never reviews work it authored: the artifacts were written by the build agent,
 * not by the panel models; this is disclosed as a limitation anyway (the panel may share
 * a model family with the authoring agent).
 *
 * Dry run (--dry-run): deterministic stub reviews — deliberately mixed ratings so the
 * agreement and kappa math is exercised. Output goes to dry-run/, headed
 * "DRY RUN – NOT REAL RESULTS". evaluation/results.md is left untouched.
 *
 * Usage: node evaluation/run-review-panel.mjs [--dry-run]
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  REPO, IS_DRY_RUN, requireModel, chatWithRetry, outDir, writeOutput,
  regenerateResults, parseJsonLoose, cohensKappa,
} from "./lib/common.mjs";

// ------------------------------------------------------------------ rubric (from the structured review form)
const RUBRIC = [
  { id: 1, short: "Intake reframes before solutioning", question: "The intake artifacts capture the request verbatim and reframe it into a business problem before any solution is chosen." },
  { id: 2, short: "Every cause has cited evidence", question: "Each claimed root cause is supported by cited evidence from the discovery artifacts." },
  { id: 3, short: "Analysis would survive expert scrutiny", question: "The BEM and Mager & Pipe reasoning is applied correctly and would survive scrutiny by an experienced performance consultant." },
  { id: 4, short: "Proposal is business-ready", question: "The stakeholder proposal leads with the recommendation, keeps a business tone, and stays within roughly two pages." },
  { id: 5, short: "Action map ties activities to behavior", question: "The action map ties every activity to an observable behavior and the business goal, with no content-dump activities." },
  { id: 6, short: "No obviously right scenario option", question: "At no decision point in the scenario is one option obviously correct; the mistakes are attractive." },
  { id: 7, short: "Consequence-based feedback", question: "The scenario gives feedback through consequences and reactions, not 'correct/incorrect' labels or scores." },
  { id: 8, short: "Measurement plan holds up", question: "Leading and lagging indicators tie to the business goal, with a plausible isolation design and named confounds." },
  { id: 9, short: "Accessibility baseline met", question: "Charts have alt text with the takeaway plus data tables; diagrams have text summaries; the scenario supports keyboard and focus; the accessibility claims match the evidence." },
  { id: 10, short: "Simulated material clearly labeled", question: "All fictional and simulated material is clearly labeled as constructed for portfolio purposes, and AI-generated evaluation is labeled by method." },
  { id: 11, short: "A first-time reader can follow it", question: "A first-time reader can follow the thread request → discovery → analysis → solution → measurement without getting lost." },
];
const RATING_CATEGORIES = ["pass", "concern", "fail"];

const ROLES = [
  {
    id: "R1",
    name: "Learning design reviewer",
    focus: "action mapping, scenario structure, branching quality, debrief, feedback design, practice-activity design",
    artifacts: ["docs/04-solution/action-map.md", "docs/05-build/scenario-design.md", "src/scenario.twee", "docs/05-build/30-day-challenge.md"],
  },
  {
    id: "R2",
    name: "Performance consulting & measurement reviewer",
    focus: "intake quality, root-cause logic, proposal persuasiveness, cost logic, measurement design, isolation strategy",
    artifacts: ["docs/01-intake/intake-form-completed.md", "docs/03-analysis/root-cause-bem.md", "docs/03-analysis/is-it-training.md", "docs/04-solution/stakeholder-proposal.md", "docs/06-measure/measurement-plan.md"],
  },
  {
    id: "R3",
    name: "Accessibility & clarity reviewer",
    focus: "WCAG claims vs evidence, alt text, diagram summaries, keyboard/focus evidence, plain language, honesty labeling",
    artifacts: ["docs/02-discovery/survey-analysis.md", "docs/05-build/scenario-design.md", "docs/06-measure/usability-test-report.md", "docs/02-discovery/survey-data-readme.md"],
  },
];

// ------------------------------------------------------------------ corpus
function loadArtifacts(paths) {
  return paths
    .map((p) => {
      const abs = resolve(REPO, p);
      if (!existsSync(abs)) return null;
      let text = readFileSync(abs, "utf8");
      if (text.length > 9000) text = `${text.slice(0, 9000)}\n\n[…truncated for the review packet…]`;
      return `===== ${p} =====\n${text}`;
    })
    .filter(Boolean)
    .join("\n\n");
}

console.log(IS_DRY_RUN ? "REVIEW PANEL — DRY RUN (stub reviews, no network calls)" : "REVIEW PANEL — real run");
const stubModel = (slot) => ({ slot, name: `dry-run-stub-${slot.toLowerCase()}`, baseUrl: "", apiKey: "" });
const MODEL_A = IS_DRY_RUN ? stubModel("MODEL_A") : requireModel("MODEL_A");
const MODEL_B = IS_DRY_RUN ? stubModel("MODEL_B") : requireModel("MODEL_B");
const MODEL_C = IS_DRY_RUN ? null : requireModel("MODEL_C", { required: false });
const models = [MODEL_A, MODEL_B, MODEL_C].filter(Boolean);

const runId = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const dir = outDir("panel-results");

const SYSTEM = (role) => `You are an independent ${role.name} reviewing learning-design portfolio artifacts. Your focus: ${role.focus}.

You are reviewing a portfolio case study built with SIMULATED data (a fictional organization, constructed for portfolio purposes). Judge the craft and the honesty of the artifacts, not whether the organization is real.

Be specific and skeptical. Praise only what earns it. Respond ONLY with JSON.`;

const REVIEW_INSTRUCTION = (role) => `Review packet:
${"<<<PACKET>>>"}

RUBRIC — for each item, give a rating:
- "pass": solid as is
- "concern": usable but has a real weakness a stakeholder would notice
- "fail": materially wrong, missing, or misleading

Respond with ONLY this JSON:
{
  "ratings": { "1": "pass|concern|fail", ... all ${RUBRIC.length} items },
  "findings": [
    { "severity": "high|medium|low", "artifact": "file or page name", "issue": "what is wrong, specifically", "suggestion": "what to change" }
  ],
  "overall": "two or three sentences: the strongest and weakest aspects from your ${role.name} perspective"
}
Include 2–6 findings. Rate every rubric item.`;

// ------------------------------------------------------------------ run reviews
const reviews = [];
let errors = 0;
for (const model of models) {
  for (const role of ROLES) {
    const label = `${model.slot}/${role.id}`;
    process.stdout.write(`  review ${label} … `);
    const review = {
      model: model.name,
      model_slot: model.slot,
      role: role.id,
      role_name: role.name,
      ratings: {},
      findings: [],
      overall: null,
      error: null,
      raw: null,
    };
    try {
      const packet = loadArtifacts(role.artifacts);
      const prompt = REVIEW_INSTRUCTION(role).replace("<<<PACKET>>>", packet);
      const stub = () => {
        // Deterministic stub: mostly pass, a couple of concerns, one fail — so the
        // agreement/kappa math is genuinely exercised. (A and B differ on item 6.)
        const base = Object.fromEntries(RUBRIC.map((r) => [String(r.id), "pass"]));
        base["3"] = "concern"; base["8"] = "concern"; base["11"] = "concern";
        if (model.slot === "MODEL_A") base["6"] = "fail"; else base["6"] = "concern";
        if (model.slot === "MODEL_C") base["9"] = "fail";
        return JSON.stringify({
          ratings: base,
          findings: [
            { severity: "medium", artifact: "(dry-run stub artifact)", issue: "(dry-run stub finding — not a model output)", suggestion: "(stub)" },
          ],
          overall: "(dry-run stub overall assessment)",
        });
      };
      const reply = await chatWithRetry(model, [
        { role: "system", content: SYSTEM(role) },
        { role: "user", content: prompt },
      ], { temperature: 0.2, maxTokens: 1600, stub });
      review.raw = reply;
      const parsed = parseJsonLoose(reply);
      for (const item of RUBRIC) {
        const r = String(parsed.ratings?.[String(item.id)] ?? "").toLowerCase();
        if (RATING_CATEGORIES.includes(r)) review.ratings[item.id] = r;
      }
      if (Object.keys(review.ratings).length !== RUBRIC.length) {
        throw new Error(`incomplete ratings (${Object.keys(review.ratings).length}/${RUBRIC.length})`);
      }
      review.findings = Array.isArray(parsed.findings) ? parsed.findings.slice(0, 10) : [];
      review.overall = String(parsed.overall || "").slice(0, 700);
      console.log(`ratings: ${RUBRIC.map((i) => review.ratings[i.id][0].toUpperCase()).join("")}`);
    } catch (e) {
      review.error = String(e.message || e);
      errors++;
      console.log(`ERROR: ${review.error}`);
    }
    reviews.push(review);
  }
}

// ------------------------------------------------------------------ agreement
const modelsOk = models.filter((m) => reviews.some((r) => r.model_slot === m.slot && !r.error));
const ratingsByModel = {};
for (const m of modelsOk) {
  const r = reviews.find((x) => x.model_slot === m.slot && !x.error);
  ratingsByModel[m.name] = r.ratings;
}
const agreement = {};
if (modelsOk.length >= 2) {
  const [m1, m2] = modelsOk.map((m) => m.name);
  for (const item of RUBRIC) {
    const a = ratingsByModel[m1][item.id];
    const b = ratingsByModel[m2][item.id];
    const identical = a === b;
    agreement[item.id] = { identical, pct: identical ? 100 : 0 };
  }
}
const kappaResult =
  modelsOk.length >= 2
    ? cohensKappa(
        RUBRIC.map((i) => ratingsByModel[modelsOk[0].name][i.id]),
        RUBRIC.map((i) => ratingsByModel[modelsOk[1].name][i.id]),
        RATING_CATEGORIES
      )
    : { kappa: "n/a", pct: 0 };
const identicalCount = RUBRIC.filter((i) => agreement[i.id]?.identical).length;

// ------------------------------------------------------------------ outputs
const summary = {
  run_id: runId,
  generated: new Date().toISOString(),
  dry_run: IS_DRY_RUN,
  roles: ROLES.map((r) => `${r.id} ${r.name}`),
  models: modelsOk.map((m) => m.name),
  rubric: RUBRIC.map((r) => ({ id: r.id, short: r.short })),
  ratings: ratingsByModel,
  agreement,
  agreement_overall: { pct: kappaResult.pct, kappa: kappaResult.kappa, identical: identicalCount, of: RUBRIC.length },
  findings_count: reviews.filter((r) => !r.error).reduce((a, r) => a + r.findings.length, 0),
  errors,
};
writeOutput(dir, "summary.json", JSON.stringify(summary, null, 2));
writeOutput(dir, "reviews.jsonl", reviews.map((r) => JSON.stringify(r)).join("\n") + "\n");

const lines = [];
lines.push(`# Multi-model review panel — ${runId}`);
lines.push("");
lines.push(IS_DRY_RUN ? "**DRY RUN – NOT REAL RESULTS** (stub reviews)" : `Models: ${modelsOk.map((m) => m.name).join(", ")} — agent reviewers, labeled as such; never presented as human or expert feedback.`);
lines.push("");
lines.push(`Roles: ${ROLES.map((r) => `${r.id} (${r.name})`).join(" · ")}. Each model reviewed each role against the structured review form.`);
lines.push("");
lines.push("## Rubric ratings");
lines.push("");
lines.push("| # | Item | " + modelsOk.map((m) => m.name).join(" | ") + " |");
lines.push("|---|---|" + modelsOk.map(() => "---").join("|") + "|");
for (const item of RUBRIC) {
  const row = modelsOk.map((m) => {
    const r = ratingsByModel[m.name]?.[item.id] ?? "—";
    return r === "fail" ? "**fail**" : r === "concern" ? "**concern**" : r;
  });
  lines.push(`| ${item.id} | ${item.short} | ${row.join(" | ")} |`);
}
lines.push("");
lines.push(`## Agreement across models`);
lines.push("");
lines.push(`Identical ratings: **${identicalCount}/${RUBRIC.length} (${kappaResult.pct}%)**. Cohen's κ (two primary models, 3 categories): **${kappaResult.kappa}**.`);
lines.push("");
lines.push("## Open findings");
lines.push("");
for (const r of reviews.filter((x) => !x.error)) {
  lines.push(`### ${r.model_slot} / ${r.role} — ${r.role_name}`);
  lines.push("");
  lines.push(`> ${r.overall || "(none)"}`);
  lines.push("");
  for (const f of r.findings) {
    lines.push(`- **[${f.severity}]** *${f.artifact}* — ${f.issue} → ${f.suggestion}`);
  }
  lines.push("");
}
lines.push("## Limits");
lines.push("");
lines.push("- Agent reviews are labeled as agent reviews. They are not educator, expert, or peer review, and imply no endorsement.");
lines.push("- Panel models may share a model family with the agent that authored the artifacts; that same-model limitation is disclosed in METHODS.md.");
lines.push("- Agreement here measures consistency between models, not accuracy against human judgement.");
lines.push("");
writeOutput(dir, "summary.md", lines.join("\n"));
await regenerateResults();

console.log(`\nreview panel: ${reviews.length} reviews, ${errors} errors → ${dir}`);
process.exit(errors > 0 && !IS_DRY_RUN ? 1 : 0);
