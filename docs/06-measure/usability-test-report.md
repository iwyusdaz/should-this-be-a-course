---
title: "Usability test report"
parent: "6. Measurement and testing"
nav_order: 3
---

# Usability test report — the branching scenario and job aid

> **Read the labels.** The only testing that has been performed so far is **automated**: scripted Playwright checks and axe-core audits, run by the build agent. No humans have tested this scenario. The reviewer walkthrough and AI-simulated learner runs are pending, and a human usability protocol is ready in `evaluation/human-protocol/`. Nothing below is a claim about real learner experience.

## What was tested, and by what

| Method | Performed by | Status | What it can show |
|---|---|---|---|
| Scripted Playwright tests (keyboard-only playthrough, three ending paths with step counts, focus management, 320px reflow / 400%-zoom equivalent, no timed choices, error monitor) | Build agent, automated (Chromium 143, Playwright 1.57.0) | **Done — 11/11 passing** | The flows work; keyboard works; focus works; no reflow failures |
| ariaSnapshot captures (accessibility-tree output) | Build agent, automated | **Done** (committed in `evaluation/aria-snapshot/`) | What a screen reader would consume — *not* a substitute for a real screen reader user |
| axe-core audit (WCAG 2.1 A/AA + best practice) | Build agent, automated | **Done — 0 violations** on scenario and job aid | Standards conformance of the rendered DOM |
| Cognitive walkthrough + heuristic evaluation (Nielsen) of the scenario and the case-study pages | Reviewer agent (fresh context, not the build agent) | **Pending** — orchestrated by the portfolio owner; form ready: `evaluation/human-protocol/structured-review-form.md` | Usability and clarity gaps; not real-user evidence |
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

## What this evidence cannot show (and what would)

- **Not real users:** the scripted tests prove the *machinery* works. Whether the situation feels real, whether any option is obviously right, and what a manager would actually learn are questions for humans — the human protocol exists for exactly that and has not been run.
- **No learning claims:** nothing here shows anyone learned anything. At most, future simulated runs can surface *clarity* problems (see METHODS for the can/can't list).
- **One author's lens:** everything was built and machine-tested by the same agent. The pending reviewer walkthrough (fresh context) and the multi-model panel exist to counter that; until they run, this report is the whole of the evidence — which is why its limits are stated this prominently.
