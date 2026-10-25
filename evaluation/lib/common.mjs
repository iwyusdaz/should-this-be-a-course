/**
 * common.mjs — shared infrastructure for the pending evaluation pipelines.
 *
 * Rules implemented here (per the portfolio build standard, 00-portfolio-overview §2):
 *  - Configuration comes from .env (never committed). If a required value is missing
 *    or still a YOUR_* placeholder, the pipeline prints a clear message and exits(1)
 *    BEFORE making any network call.
 *  - --dry-run runs the full pipeline with deterministic stub "model" responses and
 *    writes everything under dry-run/, headed "DRY RUN – NOT REAL RESULTS".
 *  - Raw outputs are saved into the repo so runs are reproducible and auditable.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", ".."); // repository root (this file lives in evaluation/lib/)
export const REPO = ROOT;
export const IS_DRY_RUN = process.argv.includes("--dry-run");

// ------------------------------------------------------------------ configuration
let loaded = false;
function loadEnv() {
  if (loaded) return;
  const envPath = resolve(REPO, ".env");
  if (existsSync(envPath)) dotenv.config({ path: envPath });
  loaded = true;
}

function isPlaceholder(v) {
  return !v || String(v).trim() === "" || String(v).trim().toUpperCase().startsWith("YOUR_");
}

/**
 * Load a model slot (MODEL_A / MODEL_B / MODEL_C) from .env.
 * Exits(1) with a clear message and makes NO network calls when unconfigured.
 */
export function requireModel(slot, { required = true } = {}) {
  loadEnv();
  const base = process.env[`${slot}_BASE_URL`];
  const key = process.env[`${slot}_API_KEY`];
  const name = process.env[`${slot}_NAME`];
  const missing = [
    isPlaceholder(base) && `${slot}_BASE_URL`,
    isPlaceholder(key) && `${slot}_API_KEY`,
    isPlaceholder(name) && `${slot}_NAME`,
  ].filter(Boolean);
  if (missing.length) {
    if (!required) return null;
    console.error(`
---------------------------------------------------------------
EVALUATION PIPELINE NOT CONFIGURED (no network calls were made)

This pipeline calls an external LLM API and is PENDING until keys
are configured. Copy .env.example to .env and fill in:

    ${missing.join("\n    ")}

Then run:  npm run eval:pending
(Or verify the wiring without keys:  npm run eval:dry-run)
---------------------------------------------------------------`);
    process.exit(1);
  }
  return { slot, baseUrl: base.replace(/\/+$/, ""), apiKey: key, name };
}

// ------------------------------------------------------------------ model client
/**
 * Call an OpenAI-compatible chat completion endpoint.
 * In dry-run mode, never touches the network: `stub` decides the reply.
 */
export async function chat(model, messages, { temperature = 0.7, maxTokens = 900, stub } = {}) {
  if (IS_DRY_RUN) {
    return typeof stub === "function" ? stub(messages) : "DRY RUN STUB RESPONSE";
  }
  const res = await fetch(`${model.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${model.apiKey}`,
    },
    body: JSON.stringify({
      model: model.name,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${model.slot} API error ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error(`${model.slot} returned no content: ${JSON.stringify(data).slice(0, 200)}`);
  return text;
}

/** Small retry wrapper for real API calls (2 retries, short backoff). */
export async function chatWithRetry(model, messages, opts = {}) {
  if (IS_DRY_RUN) return chat(model, messages, opts);
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await chat(model, messages, opts);
    } catch (e) {
      lastErr = e;
      if (attempt < 2) await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
    }
  }
  throw lastErr;
}

// ------------------------------------------------------------------ output helpers
export const DRY_HEADER = "DRY RUN – NOT REAL RESULTS\n(produced with stub responses to test the pipeline wiring; never cite as evidence)\n";

/** Output dir: dry-run/… when dry-running, evaluation/… for real runs. */
export function outDir(kind) {
  const dir = IS_DRY_RUN ? resolve(ROOT, "dry-run", kind) : resolve(REPO, "evaluation", kind);
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function writeOutput(dir, name, content) {
  const path = resolve(dir, name);
  writeFileSync(path, IS_DRY_RUN ? `${DRY_HEADER}\n${content}` : content);
  return path;
}

// ------------------------------------------------------------------ results.md
const RESULTS_FILE = resolve(REPO, "evaluation/results.md");

function latestSummary(kind) {
  const base = resolve(REPO, "evaluation", kind);
  if (!existsSync(base)) return null;
  const runs = readdirSync(base).filter((d) => !d.startsWith("."));
  if (!runs.length) return null;
  const latest = runs.sort().at(-1);
  const file = resolve(base, latest, "summary.json");
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf8"));
}

/** Regenerate evaluation/results.md from the latest run summaries (or PENDING rows). */
export function regenerateResults() {
  const sim = latestSummary("simulation-results");
  const panel = latestSummary("panel-results");
  const md = [];
  md.push("---");
  md.push("sidebar: Evaluation results");
  md.push("search: exclude");
  md.push("---");
  md.push("");
  md.push("# Evaluation results");
  md.push("");
  md.push("> Generated from the latest pipeline runs in `evaluation/simulation-results/` and `evaluation/panel-results/`. Raw outputs of every run are kept alongside. See [METHODS.md](METHODS.html) for methods, prompts and the can/can't-claim list.");
  md.push("");
  md.push("## Simulated learner runs");
  md.push("");
  if (sim) {
    md.push(`Run: \`${sim.run_id}\` · \`${sim.generated}\` · ${sim.runs.length} runs across ${sim.persona_count} personas × prior-knowledge conditions × ${sim.models.join(" + ")}.`);
    md.push("");
    for (const m of sim.models) {
      md.push(`**Model \`${m}\` — choices by decision point:**`);
      md.push("");
      md.push("| Decision | Option A (avoid) | Option B (mistake) | Option C (strong) | Flag |");
      md.push("|---|---|---|---|---|");
      for (const [dp, dist] of Object.entries(sim.choice_distribution[m])) {
        const total = dist.A + dist.B + dist.C;
        const pct = (k) => `${dist[k]}/${total} (${Math.round((dist[k] / total) * 100)}%)`;
        md.push(`| ${dp} | ${pct("A")} | ${pct("B")} | ${pct("C")} | ${sim.flags[m]?.[dp] ? "**FLAGGED for revision (>75% same choice)**" : "—"} |`);
      }
      md.push("");
    }
    md.push(`**>75% same-choice revision flag:** ${sim.flags_any ? "TRIGGERED — see flagged decision points above; these decisions need revision before use." : "not triggered."}`);
    md.push("");
    md.push("**Other findings raised by simulated personas:**");
    md.push("");
    if (sim.clarity_findings?.length) {
      for (const f of sim.clarity_findings) md.push(`- ${f}`);
    } else {
      md.push("- None reported.");
    }
  } else {
    md.push("| Decision point | Choices observed | Flag |");
    md.push("|---|---|---|");
    md.push("| 1. Opening | PENDING: requires API key | — |");
    md.push("| 2. Pushback | PENDING: requires API key | — |");
    md.push("| 3. Closing | PENDING: requires API key | — |");
    md.push("");
    md.push("PENDING: requires API key. Configure `.env` (see `.env.example`) and run `npm run eval:pending`.");
  }
  md.push("");
  md.push("## Multi-model review panel");
  md.push("");
  if (panel) {
    md.push(`Run: \`${panel.run_id}\` · \`${panel.generated}\` · roles: ${panel.roles.join(", ")} · models: ${panel.models.join(" + ")}.`);
    md.push("");
    md.push("| Rubric item | " + panel.models.map((m) => `\`${m}\``).join(" | ") + " | Agreement |");
    md.push("|---|" + panel.models.map(() => "---").join("|") + "|---|");
    for (const item of panel.rubric) {
      const ratings = panel.models.map((m) => panel.ratings[m]?.[item.id] ?? "—");
      const agree = panel.agreement[item.id];
      md.push(`| ${item.id}. ${item.short} | ${ratings.map((r) => (r === "pass" ? "pass" : r === "concern" ? "**concern**" : r === "fail" ? "**FAIL**" : r)).join(" | ")} | ${agree?.identical ? "identical" : agree ? `${agree.pct}%` : "—"} |`);
    }
    md.push("");
    md.push(`Overall rubric agreement: **${panel.agreement_overall.pct}% identical ratings**, Cohen's κ = **${panel.agreement_overall.kappa}**. Open findings: ${panel.findings_count} (raw output in the run folder).`);
  } else {
    md.push("| Rubric item | Reviewer ratings | Agreement |");
    md.push("|---|---|---|");
    md.push("| 1–11 (see the structured review form) | PENDING: requires API key | PENDING |");
    md.push("");
    md.push("PENDING: requires API key. Configure `.env` (see `.env.example`) and run `npm run eval:pending`.");
  }
  md.push("");
  md.push("*Reminder: AI-simulated personas and AI reviewers are labeled as such everywhere. They are not learners, not experts, and produce no learning-gain or endorsement claims.*");
  md.push("");
  if (IS_DRY_RUN) {
    // Dry runs never touch committed result files.
    console.log("results: dry-run — evaluation/results.md left untouched (stub outputs are in dry-run/)");
    return;
  }
  writeFileSync(RESULTS_FILE, md.join("\n") + "\n");
  console.log(`results: ${RESULTS_FILE}`);
}

// ------------------------------------------------------------------ statistics
/** Cohen's kappa for two raters over categorical labels. */
export function cohensKappa(a, b, categories) {
  const n = a.length;
  if (n === 0 || n !== b.length) return { kappa: "n/a", pct: 0 };
  let agree = 0;
  const countsA = {}, countsB = {};
  for (const c of categories) { countsA[c] = 0; countsB[c] = 0; }
  for (let i = 0; i < n; i++) {
    if (a[i] === b[i]) agree++;
    countsA[a[i]] = (countsA[a[i]] ?? 0) + 1;
    countsB[b[i]] = (countsB[b[i]] ?? 0) + 1;
  }
  const po = agree / n;
  const pe = categories.reduce((acc, c) => acc + ((countsA[c] ?? 0) / n) * ((countsB[c] ?? 0) / n), 0);
  const kappa = pe === 1 ? 1 : (po - pe) / (1 - pe);
  return { kappa: Math.round(kappa * 100) / 100, pct: Math.round(po * 100) };
}

/** Extract a JSON object from a model reply (tolerates code fences and chatter). */
export function parseJsonLoose(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error(`no JSON in reply: ${text.slice(0, 120)}`);
  return JSON.parse(candidate.slice(start, end + 1));
}
