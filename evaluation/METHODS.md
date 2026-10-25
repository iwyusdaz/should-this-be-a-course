# Evaluation methods

This document records **who or what performed each evaluation method, what it can and cannot show, and exactly how the pending methods run.** Read it before quoting any evidence from this repository.

The one-paragraph status is on the [README](https://github.com/iwyusdaz/should-this-be-a-course#readme); the detailed usability report is at [docs/06-measure/usability-test-report.html](https://iwyusdaz.github.io/should-this-be-a-course/06-measure/usability-test-report.html).

---

## 1. Status table — every method, labeled

| # | Method | Performed by | Status | Can show | Cannot show |
|---|---|---|---|---|---|
| 1 | Scripted Playwright tests of the scenario (keyboard-only playthrough, three ending paths + step counts, focus management, 320px reflow / 400%-zoom equivalent, no timed choices, error monitor) | Build agent, automated (Playwright 1.57.0, Chromium 143) | **Done** — 11/11 passing (2026-10-26); results: `evaluation/scenario-test-results.json` | The flows work, keyboard works, focus works, no reflow failures | Anything about real learners |
| 2 | axe-core audits (scenario, job aid; Pages pages post-publish) | Build agent, automated (axe-core 4.11.1) | **Done** — 0 critical/serious violations | Standards conformance of rendered DOM | How assistive-technology users experience it |
| 3 | `ariaSnapshot()` accessibility-tree captures | Build agent, automated | **Done** — `evaluation/aria-snapshot/aria-snapshot.txt` | What a screen reader would consume from the browser | A real screen-reader user's experience |
| 4 | VoiceOver testing (manual protocol) | Human (portfolio owner) | **Not performed.** Guidepup automation does not function on the build machine's macOS version; no VoiceOver testing is claimed anywhere | Real AT experience | — |
| 5 | Reviewer cognitive walkthrough + heuristic evaluation (Nielsen's 10 heuristics), using the structured review form | Reviewer agent (separate agent, fresh context, did not build the repo) | **Done 2026-10-26** — report: `evaluation/agent-review.md` (live-site walkthrough, 3 personas, Nielsen heuristics, structured form; 10 findings returned and addressed) | Usability/clarity gaps | Real users; not "educator review" or "expert feedback" — labeled **Agent review** |
| 6 | Simulated learner runs (personas × prior knowledge, ≥8 runs) with the >75% same-choice revision rule | API pipeline `evaluation/run-simulations.mjs` (MODEL_A + MODEL_B) | **PENDING: requires API key** (`npm run eval:pending`) | Ambiguous options, obviously-attractive distractors, unrealistic steps | Learning gains, engagement, transfer, statistical significance |
| 7 | Multi-model AI review panel (3 reviewer roles × ≥2 models, rubric agreement + Cohen's κ) | API pipeline `evaluation/run-review-panel.mjs` | **PENDING: requires API key** (`npm run eval:pending`) | Consistent cross-model findings with agreement reported | Accuracy vs. human judgement; expert endorsement |
| 8 | Human usability sessions (n = 3–5, think-aloud; tasks and questions in the protocol) | Human (portfolio owner) | **Not run** — script, consent text, findings template ready in `evaluation/human-protocol/` | Real user experience | — |

**Labeling rule used everywhere in this repo:** every output of methods 5–7 is labeled by its method ("Agent review", "AI-simulated persona P2", "Agent review panel"). No AI output is ever presented as coming from a real person or under a human name, and no pending result is ever fabricated — tables stay marked "PENDING: requires API key" until a real run replaces them.

---

## 2. Pending pipeline 1 — simulated learner runs

### What it does

`evaluation/run-simulations.mjs` plays the scenario's three decision points to AI personas and records what each would choose, then applies the revision rule from the project plan: **any decision point where more than 75% of simulated personas pick the same option is flagged for revision** (an obviously-attractive option is a design defect in a consequences-based scenario). The flag is computed pooled across models and per model; both views are saved.

### Persona specifications

Defined in [`evaluation/personas.json`](personas.json) (4 personas × 2 prior-knowledge conditions = 8 runs per model; MODEL_A and MODEL_B both run the full set → 16 runs minimum):

| Persona | Profile | Prior knowledge conditions |
|---|---|---|
| **P1 — Nile**, newly promoted, conflict-averse | Promoted 4 months ago from senior nurse; 13 direct reports; no management training; finds hard conversations frightening | `none`, `job-aid` |
| **P2 — Marta**, experienced clinic manager, task-focused | 11 years managing; calls her daily round-ups "feedback"; skeptical of soft-skills talk; measured on throughput | `none`, `job-aid` |
| **P3 — Devon**, cautious new manager, rule-following | Promoted 6 months ago; reads every policy; worries about saying the wrong thing; defers to policy | `none`, `job-aid` |
| **P4 — Bao**, pragmatic ops-minded manager | Operations background; impatient; sees one-on-ones as admin unless shown the payoff | `none`, `job-aid` |

`job-aid` personas are told they have read the "Feedback in 5 minutes" job aid (its structure is summarized in the prompt). The option labels ("avoidant / common mistake / stronger") are **not** shown to the personas — they are internal design notes, exactly as a real player never sees them.

### Prompts and settings

- **System prompt (per persona/condition):** full persona profile + prior knowledge + the instruction to stay in character, react as the persona realistically would (including flaws), and not optimize for the "best" option.
- **Per decision:** the scene text and the three option texts (verbatim from `src/scenario.twee`'s design), then: `Respond with ONLY a JSON object: {"choice": "A"|"B"|"C", "reason": "one or two sentences, in character"}`. The full conversation is stateful — the model sees its own earlier choices.
- **End of run reflection:** `"Finally, step out of character for one reflection… {"clarity": "…was any option confusing, unrealistic, or obviously the right one?", "realism": "…did the situation feel like something that could happen on your unit?"}"`.
- **JSON repair:** one retry with `temperature 0.2` if a reply is unparseable.
- **Settings:** `temperature 0.7` (persona diversity), `max_tokens 700` per decision, 400 for the reflection; 2 retries with backoff on transport errors.
- **Endpoints:** whatever OpenAI-compatible `MODEL_A_*` / `MODEL_B_*` (`MODEL_C_*` optional) are configured in `.env`. Models are recorded by name in every output.

### Outputs

`evaluation/simulation-results/<run_id>/` — `runs.jsonl` (every raw reply), `summary.json` (distributions, flags, settings), `summary.md` (human-readable tables). `evaluation/results.md` is regenerated. **Dry runs write to `dry-run/` instead and never touch committed files.**

### Revision rule implementation

Per decision point: `flagged = max(A,B,C) / total > 0.75` over non-errored runs — pooled and per model. A flagged run prints a prominent note and marks the tables in `results.md` and `summary.md`.

### What the results can and cannot be used for

**Can:** find ambiguous or unrealistic options, obviously-attractive distractors (the >75% rule), confusing steps, and wording problems — per persona and per model. **Cannot:** show learning, engagement, transfer, retention, or anything statistical about real people. Personas share the underlying models' biases; that is why ≥2 models run the full set and both views are reported.

---

## 3. Pending pipeline 2 — multi-model review panel

### What it does

`evaluation/run-review-panel.mjs` assembles a review packet from the actual repository artifacts and has **at least two models** review them in **three roles**:

| Role | Focus | Packet artifacts |
|---|---|---|
| **R1 — Learning design reviewer** | action mapping, scenario structure, branching quality, feedback design | action map, scenario design, `src/scenario.twee`, 30-day challenge |
| **R2 — Performance consulting & measurement reviewer** | intake quality, root-cause logic, proposal, cost logic, measurement design | completed intake, BEM, is-it-training, proposal, measurement plan |
| **R3 — Accessibility & clarity reviewer** | WCAG claims vs. evidence, alt text, diagram summaries, honesty labeling | survey analysis, scenario design, usability report, survey data README |

Each model reviews **each role** (MODEL_A + MODEL_B required → ≥6 reviews), so agreement is computed across models within a role.

### Rubric and prompts

- The rubric is the **structured review form** (`evaluation/human-protocol/structured-review-form.md`): 11 fixed items, each rated `pass` / `concern` / `fail`, plus open findings (`severity`, `artifact`, `issue`, `suggestion`) and an overall assessment. The same form is used by the human protocol and the (upcoming) agent review, so results are comparable.
- **System prompt:** independent reviewer role + focus + the reminder that the case is simulated and the craft/honesty is what's being judged.
- **Settings:** `temperature 0.2`, `max_tokens 1600`, JSON-only replies with one repair retry; artifacts truncated at 9,000 characters each in the packet.

### Agreement reporting

Per rubric item: identical-rating percentage between the two primary models. Overall: % identical across all 11 items and **Cohen's κ** over the 3 rating categories (implemented in `evaluation/lib/common.mjs`). Agreement measures **consistency between models, not accuracy against human judgement**.

### Honesty boundaries

- Results are always labeled **Agent review panel** (never "educator review", "expert feedback", or "peer review").
- The panel models did not author the artifacts (the build agent did), but they may share a model family with it — the same-model limitation is disclosed here and in every results table.
- A model never judges its own output: no panel model authored any reviewed artifact.

### Outputs

`evaluation/panel-results/<run_id>/` — `reviews.jsonl` (raw reviews), `summary.json` (ratings, agreement, κ), `summary.md` (tables). `evaluation/results.md` regenerated.

---

## 4. How to run the pending evaluations

```bash
# 1. Configure (once). Copy .env.example to .env and fill in at least MODEL_A_* and MODEL_B_*.
cp .env.example .env

# 2. Verify the wiring with no keys (writes stub outputs to dry-run/):
npm run eval:dry-run

# 3. Real run (simulated learner runs + review panel):
npm run eval:pending
```

- Missing or `YOUR_`-placeholder values make both pipelines exit with code 1 and a clear message **before any network call**. `eval:dry-run` needs no keys at all.
- After a real run: regenerate/commit the run folders, check `evaluation/results.md`, then update the evaluation-status line in `README.md`, section 1 of this file, `docs/06-measure/usability-test-report.md`, and `STATUS.md`.
- `dry-run/` output is stubbed wiring-proof only — never cite it as evidence, and never commit it.

## 5. How human testing would be added

Everything a human run needs is in `evaluation/human-protocol/`:

| File | Purpose |
|---|---|
| `usability-test-script.md` | Session script for n = 3–5 participants (play-through, then think-aloud), tasks and questions |
| `consent-text.md` | Informed consent text (no personal data beyond first names; recordings deleted after analysis) |
| `findings-template.md` | Findings log with severity + the revision ledger (each finding → revision → evidence) |
| `structured-review-form.md` | The 11-item review form shared by the human protocol, the agent review, and the panel |
| `manual-voiceover-check.md` | Step-by-step manual VoiceOver check of the scenario (macOS) |

After human sessions: add a "Human usability sessions" row to the status table in section 1, summarize findings in the usability test report, and update the README status line. Human findings always outrank agent findings in revision decisions.

## 6. Global limits of the AI-based evaluation

1. **No learning claims.** Neither the personas nor any other method in this repo can demonstrate that anyone learned anything.
2. **No statistical significance.** Run counts are design-probing samples, not studies.
3. **Same-model limitation.** The reviewer agent and the panel models may share a model family with the build agent; disclosed wherever results appear.
4. **Simulated case.** Every artifact under review describes a fictional organization; the reviews assess craft and honesty of the artifacts, not a real intervention.
5. **Pending means pending.** Until the API keys exist and the pipelines run, all results tables stay "PENDING: requires API key" — nothing is pre-filled.
