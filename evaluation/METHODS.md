# Evaluation methods

This document records **who or what performed each evaluation method, what it can and cannot show, and exactly how the agent-simulated methods were run.** Read it before quoting any evidence from this repository.

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
| 6 | Agent-simulated learner runs (4 personas × 2 prior-knowledge conditions = 8 runs) with the >75% same-choice revision rule | One AI agent, single model, in the build environment (no API calls) | **Done 2026-11-11.** No decision point flagged (highest pooled share 62.5%). Results: [results.md](results.md); raw runs: [agent-simulated/simulation-runs.json](agent-simulated/simulation-runs.json) | Ambiguous options, obviously attractive distractors, unrealistic steps, as judged by one model | Learning gains, engagement, transfer, statistical significance, cross-model consistency |
| 7 | Agent-simulated review panel (3 reviewer roles, 11-item structured review form) | The same single AI agent, playing each role in turn (no API calls) | **Done 2026-11-11.** 9 pass, 2 concern, 0 fail; 8 open findings, not yet fixed. Record: [agent-simulated/review-panel.md](agent-simulated/review-panel.md) | One model's structured findings against the rubric | Agreement between reviewers (none computed), accuracy against human judgement, expert endorsement |
| 8 | Human usability sessions (n = 3–5, think-aloud; tasks and questions in the protocol) | Human (portfolio owner) | **Not run** — script, consent text, findings template ready in `evaluation/human-protocol/` | Real user experience | — |

**Labeling rule used everywhere in this repo:** every output of methods 5 to 7 is labeled by its method ("Agent review", "Agent-simulated persona P2", "Agent-simulated review panel"). No AI output is ever presented as coming from a real person or under a human name, and no result is invented: methods 6 and 7 report exactly what the agent produced in the files linked above.

---

## 2. Agent-simulated learner runs (method 6)

### What was run, and by what

On 2026-11-11 one AI agent (the Kiro workflow agent, a single model) played each persona through the scenario's three decision points inside the build environment. No API key, external model endpoint or local model was used. The agent recorded each choice, a one- or two-sentence in-character reason, and an out-of-character reflection on clarity and realism.

### What changed from the original design, and why it matters

The original plan was a blind, cross-model run: at least two different models (MODEL_A and MODEL_B) would each play all 8 runs through an API, seeing only the scene and option text, so model bias could be compared. That design cannot be reproduced without API access, so this run differs in three ways:

1. **One model, not two.** There is no per-model view and no way to separate the persona's behavior from this one model's bias.
2. **Not blind.** Before playing, the agent had read the full scenario source, including the outcome passages, the debrief that names each option as strong, mistake or avoidant, and the earlier agent review's prediction of which options would be flagged. The choices are the agent's judgment of how each persona would realistically act, not a fresh reaction.
3. **Same agent as the reviewer.** The same agent also played the review panel (method 7).

Treat the results as one model's design probe, weaker evidence than the planned design.

### Personas and conditions

Defined in [`evaluation/personas.json`](personas.json): 4 personas × 2 prior-knowledge conditions = 8 runs.

| Persona | Profile | Prior knowledge conditions |
|---|---|---|
| **P1, Nile**, newly promoted, conflict-averse | Promoted 4 months ago from senior nurse; 13 direct reports; no management training; finds hard conversations frightening | `none`, `job-aid` |
| **P2, Marta**, experienced clinic manager, task-focused | 11 years managing; calls her daily round-ups "feedback"; skeptical of soft-skills talk; measured on throughput | `none`, `job-aid` |
| **P3, Devon**, cautious new manager, rule-following | Promoted 6 months ago; reads every policy; worries about saying the wrong thing; defers to policy | `none`, `job-aid` |
| **P4, Bao**, pragmatic ops-minded manager | Operations background; impatient; sees one-on-ones as admin unless shown the payoff | `none`, `job-aid` |

In the `job-aid` condition the persona is assumed to have read the "Feedback in 5 minutes" job aid before playing.

### Revision rule

Per decision point: `flagged = max(A, B, C) / 8 > 0.75` over the pooled runs. A per-condition breakdown is reported for context. A per-model view is not possible with one model.

### Result

No decision point was flagged. Highest pooled share: 62.5% (Decision 2, strong option). The tables, the per-condition breakdown and what the runs suggest are in [results.md](results.md).

---

## 3. Agent-simulated review panel (method 7)

### What was run, and by what

On 2026-11-11 the same single agent reviewed the repository artifacts in three roles, one after another, using the 11-item [structured review form](human-protocol/structured-review-form.md) (`pass` / `concern` / `fail`, plus open findings and an overall assessment). Each role read its packet in full and rated only the rubric items its packet covers:

| Role | Focus | Packet artifacts | Items rated |
|---|---|---|---|
| **R1, Learning design reviewer** | action mapping, scenario structure, branching quality, feedback design | action map, scenario design, `src/scenario.twee`, 30-day challenge | 5, 6, 7, 11 |
| **R2, Performance consulting and measurement reviewer** | intake quality, root-cause logic, proposal, cost logic, measurement design | completed intake, BEM, is-it-training, proposal, measurement plan | 1, 2, 3, 4, 8 |
| **R3, Accessibility and clarity reviewer** | WCAG claims vs. evidence, alt text, diagram summaries, honesty labeling | survey analysis, survey data README, scenario design, usability report | 9, 10 |

### What changed from the original design

The original plan had at least two different models review each role, with per-item agreement and Cohen's κ between models. With one model there is no second rater, so **no agreement statistic is reported**. The panel model may share a model family with the agent that built the artifacts. It did not author the artifacts it reviewed.

### Result

9 pass, 2 concern (item 4, proposal; item 6, scenario options), 0 fail. Eight open findings (3 medium, 5 low) are recorded with suggested changes in [agent-simulated/review-panel.md](agent-simulated/review-panel.md). They were not fixed in this round.

### Honesty boundaries

- Results are always labeled **agent-simulated review panel**, never "educator review", "expert feedback" or "peer review".
- The ratings are one model's opinions. Human review outranks them.

---

## 4. Reproducing or extending the agent-simulated runs

No API keys or environment files are needed, and nothing in this repository calls an external model. To repeat the runs, an agent (or a person) plays each persona in `personas.json` through the published scenario, records choices and reasons in the same JSON shape as [agent-simulated/simulation-runs.json](agent-simulated/simulation-runs.json), and completes the structured review form once per role. Label any new run with who performed it, the date and whether it was blind.

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
3. **Same-model limitation.** Methods 6 and 7 were performed by one agent using one model, which may share a model family with the build agent and the method 5 reviewer. Disclosed wherever results appear.
4. **Simulated case.** Every artifact under review describes a fictional organization; the reviews assess craft and honesty of the artifacts, not a real intervention.
5. **Agent-simulated means agent-simulated.** The persona runs and panel ratings are an AI agent's role-play, not real learners or reviewers, and the cross-model blind design originally planned was not run.
