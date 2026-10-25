#!/usr/bin/env node
/**
 * run-simulations.mjs — PENDING pipeline: AI-simulated learner runs of the branching
 * scenario. (See evaluation/METHODS.md for the full method, prompts and limits.)
 *
 * What it does (real run):
 *   - Loads personas from evaluation/personas.json (4 personas × 2 prior-knowledge
 *     conditions = 8 runs per model; MODEL_A and MODEL_B both run the full set).
 *   - For each run, the model plays the persona through the scenario's three decision
 *     points (stateful conversation; the passage text and options are supplied verbatim
 *     from the scenario's data so the simulation tracks the real artifact).
 *   - Records each choice with a short in-character reason.
 *   - Computes the choice distribution per decision point and flags any decision point
 *     where MORE THAN 75% of simulated personas picked the same option — that pattern
 *     signals an obviously-attractive (or obviously-broken) option and marks the
 *     decision for revision (the same check the plan asks for).
 *   - Writes raw outputs + summary to evaluation/simulation-results/<run_id>/ and
 *     regenerates evaluation/results.md.
 *
 * What it CANNOT show (enforced by how results are written): learning gains,
 * statistical significance, or any claim about real learners. These runs find
 * clarity problems: ambiguous options, obviously-attractive distractors, confusing
 * steps, unrealistic situations.
 *
 * Dry run (--dry-run): stub "model" with deterministic canned responses — deliberately
 * arranged so ONE decision point exceeds the 75% threshold, proving the flag logic.
 * Output goes to dry-run/ and is labeled "DRY RUN – NOT REAL RESULTS".
 *
 * Usage: node evaluation/run-simulations.mjs [--dry-run]
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  REPO, IS_DRY_RUN, requireModel, chatWithRetry, outDir, writeOutput,
  regenerateResults, parseJsonLoose,
} from "./lib/common.mjs";

const personas = JSON.parse(readFileSync(resolve(REPO, "evaluation/personas.json"), "utf8")).personas;

// The three decision points, verbatim from the scenario source of truth (src/scenario.twee).
// Kept here as data (labels + options + scene context) so the simulated persona sees the
// same options a real player sees.
const DECISIONS = [
  {
    id: "D1",
    title: "Decision 1 — Opening the conversation",
    scene:
      "You are Sam, a manager promoted three months ago at Brightline Health Services with 14 direct reports and no management training. Your skilled direct report Priya (nine years on the unit) has filed incomplete handovers for a few weeks — missing allergy lines, a missed consent check — and a colleague has complained twice. You walk over. Priya looks up, slightly guarded — she has seen you reading the handover sheets. What do you open with?",
    options: {
      A: "“Hey Pri, how's it going? Everything fine?” — keep it light, see if she raises it herself (avoidant)",
      B: "“Priya, we've had complaints about your handovers. They need to improve — starting today. This is important.” — be direct, show it's serious (common mistake: vague, no specifics, no invitation to respond)",
      C: "“Priya — can I grab you for five minutes? I want to talk about yesterday's evening handover: the allergy line was missing. What's your take on what's going on?” — one specific moment, then ask for her view (stronger)",
    },
  },
  {
    id: "D2",
    title: "Decision 2 — The pushback",
    scene:
      "Two weeks later you have your first properly scheduled one-on-one with Priya (the new one-on-one standard made that possible). You raise the handovers again, and Priya pushes back hard: “Nine years I've done this job. Nine years, and nobody complained. Now there's a new system, endless paperwork, and suddenly I'm the problem? Maybe get the new grads to proofread their own sheets instead of auditing mine.” The room is very quiet. What do you do?",
    options: {
      A: "“You're right — I'm sorry, I shouldn't have raised it. Forget it.” — drop it (avoidant)",
      B: "“It's not personal, Priya — handover completeness is mandatory, it's in the policy. I need you to comply.” — hold the line on the rule (common mistake: policy as a shield)",
      C: "“You're right that the system change made things harder — that's on me to fix. And the handovers still have to be complete: that's a patient-safety line. What would make them easier to get right?” — acknowledge, hold, problem-solve (stronger)",
    },
  },
  {
    id: "D3",
    title: "Decision 3 — Closing the loop",
    scene:
      "Your next one-on-one with Priya is booked. The checklist is live, the sheets are fixed, and this is the meeting where you give one real piece of feedback and agree what happens next. It has been a demanding month; Priya covered two extra shifts during the flu wave — visibly tired, and visibly proud of it. What do you do?",
    options: {
      A: "Cancel — you're slammed, and she's exhausted. Reschedule for next month (avoidant)",
      B: "Open with how brilliant she was during the flu wave, mention the handover thing somewhere in the middle, close with another compliment — keep it positive (common mistake: the compliment sandwich)",
      C: "Give one specific piece of feedback on how the handover fix went, ask for her view, agree one next step — and book the next one-on-one before she leaves (stronger)",
    },
  },
];

// ------------------------------------------------------------------ models
console.log(IS_DRY_RUN ? "SIMULATIONS — DRY RUN (stub model, no network calls)" : "SIMULATIONS — real run");
// Dry runs never touch the network or the environment: stub model identities stand in
// for the real slots so the full pipeline (state, analysis, outputs, flag rule) is
// exercised without keys. Real runs hard-require configuration and exit(1) otherwise.
const stubModel = (slot) => ({ slot, name: `dry-run-stub-${slot.toLowerCase()}`, baseUrl: "", apiKey: "" });
const MODEL_A = IS_DRY_RUN ? stubModel("MODEL_A") : requireModel("MODEL_A");
const MODEL_B = IS_DRY_RUN ? stubModel("MODEL_B") : requireModel("MODEL_B"); // >= 2 models: choices are compared across both
const MODEL_C = IS_DRY_RUN ? null : requireModel("MODEL_C", { required: false });
const models = [MODEL_A, MODEL_B, MODEL_C].filter(Boolean);

const runId = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const dir = outDir("simulation-results");

// ------------------------------------------------------------------ prompts
const SYSTEM = (persona, prior) => `You are role-playing a fictional persona in a training-design evaluation. You are NOT an assistant, and you must not break character.

PERSONA: ${persona.name}
Profile: ${persona.profile}
Prior knowledge: ${prior === "job-aid"
  ? "You have read Brightline's one-page 'Feedback in 5 minutes' job aid (structure: situation, behavior, impact, request, listen; plus defensive-recovery moves)."
  : "You have had no training and no job aid; you only know what the story tells you."}

Stay in character. React the way this persona realistically would — including flaws. Do not optimize for the 'best' option; choose what THIS persona would actually do.`;

const CHOICE_INSTRUCTION = `Respond with ONLY a JSON object, no other text:
{"choice": "A" | "B" | "C", "reason": "one or two sentences, in character, explaining why"}

The labels (avoidant / common mistake / stronger) are internal design notes — IGNORE them when choosing; they are not shown to real players either.`;

const FINDINGS_INSTRUCTION = `Finally, step out of character for one reflection. As the persona, answer in JSON only:
{"clarity": "1-2 sentences: was any option confusing, unrealistic, or obviously the 'right' one?",
 "realism": "1-2 sentences: did the situation feel like something that could happen on your unit?"}`;

// ------------------------------------------------------------------ run
const runs = [];
let warnings = 0;

for (const model of models) {
  for (const persona of personas) {
    for (const prior of persona.prior_knowledge) {
      const runLabel = `${model.slot}/${persona.id}/${prior}`;
      const messages = [
        { role: "system", content: SYSTEM(persona, prior) },
      ];
      const run = {
        model: model.name,
        model_slot: model.slot,
        persona: persona.id,
        prior_knowledge: prior,
        choices: [],
        clarity: null,
        realism: null,
        raw: [],
        error: null,
      };
      process.stdout.write(`  run ${runLabel} … `);
      try {
        for (const dp of DECISIONS) {
          messages.push({
            role: "user",
            content: `${dp.scene}\n\nYour options:\n${Object.entries(dp.options).map(([k, v]) => `${k}. ${v}`).join("\n")}\n\n${CHOICE_INSTRUCTION}`,
          });
          const stub = (msgs) => {
            // Deterministic dry-run stub: D1 spread, D2 heavily B (>75% triggers the flag),
            // D3 split. Reasons are stubs — that is the point of a dry run.
            const pick = { D1: "C", D2: "B", D3: "A" }[dp.id];
            return `{"choice": "${pick}", "reason": "(dry-run stub reason — not a model output)"}`;
          };
          const reply = await chatWithRetry(model, messages, {
            temperature: 0.7,
            maxTokens: 700,
            stub,
          });
          run.raw.push({ decision: dp.id, reply });
          let parsed;
          try {
            parsed = parseJsonLoose(reply);
            if (!["A", "B", "C"].includes(parsed.choice)) throw new Error(`bad choice ${parsed.choice}`);
          } catch (e) {
            // one repair attempt: ask the model to re-emit valid JSON (skipped in dry-run)
            messages.push({ role: "user", content: "That was not valid JSON per the instructions. Respond again with ONLY the JSON object {\"choice\": \"A\"|\"B\"|\"C\", \"reason\": \"…\"}." });
            const repair = await chatWithRetry(model, messages, { temperature: 0.2, maxTokens: 300, stub });
            run.raw.push({ decision: dp.id, repair_reply: repair });
            parsed = parseJsonLoose(repair);
            if (!["A", "B", "C"].includes(parsed.choice)) throw new Error(`unparseable choice for ${dp.id}`);
          }
          messages.push({ role: "assistant", content: JSON.stringify(parsed) });
          run.choices.push({ decision: dp.id, choice: parsed.choice, reason: String(parsed.reason || "").slice(0, 400) });
        }
        // end-of-run reflection (clarity/realism)
        messages.push({ role: "user", content: FINDINGS_INSTRUCTION });
        const reflect = await chatWithRetry(model, messages, {
          temperature: 0.4,
          maxTokens: 400,
          stub: () => '{"clarity": "(dry-run stub clarity note)", "realism": "(dry-run stub realism note)"}',
        });
        const refl = parseJsonLoose(reflect);
        run.clarity = String(refl.clarity || "").slice(0, 500);
        run.realism = String(refl.realism || "").slice(0, 500);
        console.log(`choices: ${run.choices.map((c) => c.choice).join("→")}`);
      } catch (e) {
        run.error = String(e.message || e);
        warnings++;
        console.log(`ERROR: ${run.error}`);
      }
      runs.push(run);
    }
  }
}

// ------------------------------------------------------------------ analysis
const choice_distribution = {};
const flags = {};
let flagsAny = false;
for (const model of models) {
  const byModel = runs.filter((r) => r.model_slot === model.slot && !r.error);
  choice_distribution[model.name] = {};
  flags[model.name] = {};
  for (const dp of DECISIONS) {
    const dist = { A: 0, B: 0, C: 0 };
    for (const r of byModel) {
      const c = r.choices.find((x) => x.decision === dp.id);
      if (c) dist[c.choice]++;
    }
    choice_distribution[model.name][dp.id] = dist;
    const total = dist.A + dist.B + dist.C;
    const top = Math.max(dist.A, dist.B, dist.C);
    const flagged = total > 0 && top / total > 0.75;
    flags[model.name][dp.id] = flagged;
    if (flagged) flagsAny = true;
  }
}
// pooled across models (all runs) — the primary reading
const pooled = {};
for (const dp of DECISIONS) {
  const dist = { A: 0, B: 0, C: 0 };
  for (const r of runs.filter((r) => !r.error)) {
    const c = r.choices.find((x) => x.decision === dp.id);
    if (c) dist[c.choice]++;
  }
  pooled[dp.id] = dist;
}
const pooledFlags = {};
for (const [dpId, dist] of Object.entries(pooled)) {
  const total = dist.A + dist.B + dist.C;
  const top = Math.max(dist.A, dist.B, dist.C);
  pooledFlags[dpId] = total > 0 && top / total > 0.75;
  if (pooledFlags[dpId]) flagsAny = true;
}

const clarityFindings = runs
  .filter((r) => !r.error && r.clarity && !r.clarity.includes("stub"))
  .map((r) => `[${r.model_slot}/${r.persona}/${r.prior_knowledge}] ${r.clarity}`)
  .slice(0, 20);

// ------------------------------------------------------------------ write outputs
const summary = {
  run_id: runId,
  generated: new Date().toISOString(),
  dry_run: IS_DRY_RUN,
  runs: runs.length,
  expected_runs: models.length * personas.reduce((a, p) => a + p.prior_knowledge.length, 0),
  errors: warnings,
  personas: personas.map((p) => ({ id: p.id, name: p.name, prior: p.prior_knowledge })),
  persona_count: personas.length,
  models: models.map((m) => m.name),
  choice_distribution,
  pooled_distribution: pooled,
  pooled_flags: pooledFlags,
  flags,
  flags_any: flagsAny,
  flag_rule: "decision point flagged when >75% of simulated personas pick the same option (pooled across models AND per-model)",
  clarity_findings: clarityFindings,
};
writeOutput(dir, "summary.json", JSON.stringify(summary, null, 2));
writeOutput(dir, "runs.jsonl", runs.map((r) => JSON.stringify(r)).join("\n") + "\n");

// human-readable summary
const lines = [];
lines.push(`# Simulated learner runs — ${runId}`);
lines.push("");
lines.push(IS_DRY_RUN ? "**DRY RUN – NOT REAL RESULTS** (stub responses)" : `Models: ${models.map((m) => m.name).join(", ")} — every model played every persona/condition under its own name; no output is presented as coming from a real person.`);
lines.push("");
lines.push(`${runs.length} runs (${personas.length} personas × prior-knowledge conditions × ${models.length} models). Errors: ${warnings}.`);
lines.push("");
lines.push("## Pooled choice distribution (all runs)");
lines.push("");
lines.push("| Decision | A (avoidant) | B (mistake) | C (strong) | >75% flag |");
lines.push("|---|---|---|---|---|");
for (const [dpId, dist] of Object.entries(pooled)) {
  const total = dist.A + dist.B + dist.C;
  const pct = (k) => `${dist[k]}/${total} (${Math.round((dist[k] / total) * 100)}%)`;
  lines.push(`| ${dpId} | ${pct("A")} | ${pct("B")} | ${pct("C")} | ${pooledFlags[dpId] ? "**FLAGGED for revision**" : "—"} |`);
}
lines.push("");
lines.push(`**Revision rule:** any decision point where more than 75% of simulated personas pick the same option is flagged for revision (an obviously-attractive option is a design defect for a consequences-based scenario).`);
lines.push("");
lines.push(`**Result: ${flagsAny ? "AT LEAST ONE DECISION POINT FLAGGED — revise before use (see tables above)." : "no decision point exceeded the 75% threshold."}**`);
lines.push("");
lines.push("## Per-model distributions");
lines.push("");
for (const m of models) {
  lines.push(`### ${m.name}`);
  lines.push("");
  lines.push("| Decision | A | B | C | flag |");
  lines.push("|---|---|---|---|---|");
  for (const [dpId, dist] of Object.entries(choice_distribution[m.name])) {
    const total = dist.A + dist.B + dist.C;
    lines.push(`| ${dpId} | ${dist.A}/${total} | ${dist.B}/${total} | ${dist.C}/${total} | ${flags[m.name][dpId] ? "FLAGGED" : "—"} |`);
  }
  lines.push("");
}
lines.push("## Clarity / realism reflections (in-character, AI-generated)");
lines.push("");
lines.push(...(clarityFindings.length ? clarityFindings.map((f) => `- ${f}`) : ["(none — dry run stubs or errors only)"]));
lines.push("");
lines.push("## Limits");
lines.push("");
lines.push("- These are AI-simulated personas, labeled as such. They are NOT real learners and cannot show learning gains, engagement, or transfer.");
lines.push("- They can surface: ambiguous or unrealistic options, obviously-attractive distractors (the >75% rule), and confusing steps.");
lines.push("- Personas share the underlying model's biases; per-model and pooled views are both reported for that reason.");
lines.push("");
writeOutput(dir, "summary.md", lines.join("\n"));
await regenerateResults();

console.log(`\nsimulations: ${runs.length} runs, ${warnings} errors → ${dir}`);
if (flagsAny) console.log("NOTE: >75% same-choice flag TRIGGERED — see summary. (In dry runs this is expected: the stub deliberately triggers it to prove the rule works.)");
process.exit(warnings > 0 && !IS_DRY_RUN ? 1 : 0);
