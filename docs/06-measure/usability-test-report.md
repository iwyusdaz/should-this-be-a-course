---
title: "Usability test report"
parent: "6. Measurement and testing"
nav_order: 3
---

# Usability test report — the branching scenario and job aid

> **Read the labels.** The testing performed so far is **automated and agent-based**: scripted Playwright checks and axe-core audits run by the build agent, plus a **fresh-context agent design review** (completed 2026-10-26, [`evaluation/agent-review.md`](https://github.com/iwyusdaz/should-this-be-a-course/blob/main/evaluation/agent-review.md)). No humans have tested this scenario. The AI-simulated learner runs and review panel are still pending, and a human usability protocol is ready in `evaluation/human-protocol/`. Nothing below is a claim about real learner experience.

## What was tested, and by what

| Method | Performed by | Status | What it can show |
|---|---|---|---|
| Scripted Playwright tests (keyboard-only playthrough, three ending paths with step counts, focus management, 320px reflow / 400%-zoom equivalent, no timed choices, error monitor) | Build agent, automated (Chromium 143, Playwright 1.57.0) | **Done — 11/11 passing** | The flows work; keyboard works; focus works; no reflow failures |
| ariaSnapshot captures (accessibility-tree output) | Build agent, automated | **Done** (committed in `evaluation/aria-snapshot/`) | What a screen reader would consume — *not* a substitute for a real screen reader user |
| axe-core audit (WCAG 2.1 A/AA + best practice) | Build agent, automated | **Done — 0 violations** on scenario and job aid | Standards conformance of the rendered DOM |
| Cognitive walkthrough + heuristic evaluation (Nielsen) of the scenario and the case-study pages | Reviewer agent (fresh context, not the build agent) | **Done 2026-10-26** — report: [`evaluation/agent-review.md`](https://github.com/iwyusdaz/should-this-be-a-course/blob/main/evaluation/agent-review.md); 10 findings, all addressed | Usability and clarity gaps; not real-user evidence |
| Simulated learner runs (personas × prior knowledge, ≥8 runs) | API pipeline `evaluation/run-simulations.mjs` | **Pending: requires API key** | Ambiguous options, obvious distractors, unrealistic steps; not learning gains |
| Multi-model review panel | API pipeline `evaluation/run-review-panel.mjs` | **Pending: requires API key** | Findings with model agreement; not expert endorsement |
| Human usability sessions (n = 3–5, think-aloud, per the plan) | Portfolio owner | **Not run** — script, consent text and findings template ready in `evaluation/human-protocol/` | Real user experience |
| VoiceOver (manual check protocol) | Portfolio owner | **Not performed** — Guidepup automation is not functional on the build machine's macOS version; the manual protocol is provided | Real assistive-technology experience |

Full methods, prompts and settings for the pending evaluations: [evaluation/METHODS.md](https://github.com/iwyusdaz/should-this-be-a-course/blob/main/evaluation/METHODS.md).

## Scripted test results (2026-10-26)

Machine-readable results: [`evaluation/scenario-test-results.json`](https://github.com/iwyusdaz/should-this-be-a-course/blob/main/evaluation/scenario-test-results.json). Summary:

| Check | Result |
|---|---|
| Focus moves to passage heading on first load (`tabindex="-1"`, announced title) | PASS |
| Focus moves to new passage heading after every choice | PASS |
| Keyboard-only playthrough (Tab/Enter only, from heading focus, no mouse) reaches the debrief | PASS — 11 keyboard activations |
| No keyboard trap | PASS |
| Strong path (3 strong moves) reaches **End_Improved** | PASS — 11 passages, 3 decisions |
| Mistake-heavy path reaches **End_Unresolved** | PASS — 11 passages |
| Avoidant path reaches **End_Escalated** | PASS — 11 passages |
| 320px viewport / 400%-zoom equivalent (WCAG-EM method): no horizontal scrolling at Start, Decision 2, Debrief | PASS |
| No timed choices (passage static while idle) | PASS |
| ariaSnapshot captures saved (Start / Decision 1 / Debrief) | PASS |
| Zero uncaught page errors during the entire run | PASS |

**Step counts:** every full playthrough is 12 passages (start + 3 decision points + 3 consequence scenes + 3 continuations + 1 ending + debrief), with 3 options per decision. Paths converge by design; consequence text varies with choices even where the route does not.

**Post-publish verification of the live Pages build (2026-10-26):** the deployed site was re-checked, not just the local files — axe audits of 11 key pages: **0 violations** (one axe *incomplete* on the theme's active-nav-link contrast); live link crawl: 32 pages, **0 broken**; 320px reflow re-verified on 5 live pages; Mermaid diagrams confirmed rendering. Three publishing-stage defects were found and fixed by these live checks: the Pages build originally ignored the repo-root `_config.yml` (theme fell back to the default), the Mermaid loader's `//` comments were swallowed when the build collapsed the head include onto one line, and one page had an h1→h3 heading skip.

**Screen-reader-output fallback, stated plainly:** Guidepup/VoiceOver automation was attempted and does not function on this machine's macOS version (macOS 27). What is committed (`evaluation/aria-snapshot/`) is the browser accessibility tree via Playwright's `ariaSnapshot()` — useful evidence, **not** VoiceOver testing, and **no VoiceOver testing is claimed**. The manual check protocol for a human run is in `evaluation/human-protocol/manual-voiceover-check.md`.

## Revisions made because of testing (4)

The scripted tests were run during the build, not after — each failure below was found by a machine check and fixed before publish:

1. **Focus never landed on the opening passage.** The scripted focus test showed that SugarCube's opening display does not emit the `:passagedisplay` event the focus handler listens for (it fires only on in-story navigation). **Revision:** a first-load safety net (deferred retries + one post-load re-apply) was added to the story script; the test now confirms focus lands within ~1s on cold load and instantly after every choice.
2. **The debrief's summary table broke the 320px reflow check** (scrollWidth 454px — four columns of prose cannot fit 320px). **Revision:** the table was rebuilt as three short headed lists; reflow now passes at Start, Decision 2 and Debrief.
3. **A custom light sidebar made SugarCube's menu links fail WCAG contrast** (light text `#eee` on the new light background — axe caught 2 serious nodes). **Revision:** sidebar link and hover colors were re-specified for the light theme; the audit is now 0 violations.
4. **Two choice links silently mis-parsed.** The scripted playthrough reported missing links: SugarCube's smart-quote handling mangles ASCII `"` inside `[[link->target]]` markup. **Revision:** choice labels now use typographic quotes; the all-paths test proves every option link navigates to the intended passage.

## Revisions made because of the agent review (2026-10-26)

The fresh-context agent review ([`evaluation/agent-review.md`](https://github.com/iwyusdaz/should-this-be-a-course/blob/main/evaluation/agent-review.md)) returned 10 findings; all were addressed with wording-level changes and re-verified:

1. **Scenario option telegraphing (high).** The strong option was last, longest and the only un-glossed choice in all three decisions — contradicting the design doc's own "no obviously right option" check. **Revision:** strong option moved first in Decision 1 and middle in Decision 2; editorial glosses stripped from D1/D2 labels; the strong opener trimmed; Decision 2's policy-first mistake rewritten from a caricature ("I need you to comply") to a realistic pressured-manager line. Rebuilt and re-tested: 11/11.
2. **Proposal cost table** omitted the blend's recurring 1:1 manager time (~2 h/manager/week at the median span of 13, per the repo's own document-review arithmetic). **Revision:** recurring-time row added, the compared row retitled "Training-specific time", and the 1:1 time framed as the intervention displacing rework/exit costs.
3. **Turnover savings overstated** ("roughly 6 exits / ~$56k"; the arithmetic is 7 pts × 78 ≈ 5.5 exits ≈ $51k). **Revision:** restated as ≈5–6 exits / ≈$47–56k in performance-gap, proposal, dashboard and the action map.
4. **BEM table repair:** the individual row reused the environment column labels (Information/Resources/Incentives) instead of Gilbert's Knowledge/Capacity/Motives; nine cause IDs for a four-cause story; a miscount ("four of the six environmental cells" — the model has six cells, three of them environmental, all three carrying causes). **Revision:** table split into environment/individual with Gilbert's labels, collapsed to the four primary cause IDs with a mapping note, count fixed, and the S-1 evidence cell broadened (M2's contradiction + survey Findings 1/3) so the one training-justifying cause no longer rests on a single interview.
5. **Lower-severity fixes:** job-aid example de-scoped from a scenario character's name to "a colleague"; simulated-case labels added to six pages that relied on section-index banners; the pulse target's deadline ("within 2 quarters") aligned into the measurement plan's quarterly row; the design doc's false "(opens in a new tab)" claim dropped.

Review findings noted but **not** fixed (recorded in `DECISIONS.md`): no overall progress indicator in the scenario (severity 2), the D3 option-style shift (quoted dialog vs abstract description), no "skip to the decisions" replay affordance, and unexplained jargon ("Gilbert's BEM", "Mager & Pipe") on first home-page encounter.

## What this evidence cannot show (and what would)

- **Not real users:** the scripted tests prove the *machinery* works. Whether the situation feels real, whether any option is obviously right, and what a manager would actually learn are questions for humans — the human protocol exists for exactly that and has not been run.
- **No learning claims:** nothing here shows anyone learned anything. At most, future simulated runs can surface *clarity* problems (see METHODS for the can/can't list).
- **One author's lens:** everything was built and machine-tested by the same agent. The fresh-context reviewer walkthrough has now run (2026-10-26 — see `evaluation/agent-review.md` and the revisions section above), but it is still agent evidence, not human evidence: the multi-model review panel, simulated learner runs and human sessions remain outstanding.
