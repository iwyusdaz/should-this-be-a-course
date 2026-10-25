# Repository status

Last updated: 2026-10-25

| Workstream | Status |
|---|---|
| Case study site (`docs/`, GitHub Pages, Just the Docs v0.12.0) | Complete |
| Intake, interview guide, interview notes (simulated), document review | Complete |
| Survey data: seeded generator, CSV, data dictionary, analysis with charts | Complete |
| Root-cause analysis (BEM, Mager & Pipe, is-it-training) | Complete |
| Solution design (action map, proposal, blueprint, what-we-won't-build) | Complete |
| Branching scenario (Twee + compiled HTML, keyboard + focus support) | Complete |
| Job aid (HTML + tagged PDF) and 30-day challenge | Complete |
| Measurement plan and simulated baseline dashboard | Complete |
| Scripted Playwright tests (keyboard, reflow, zoom, focus, step counts) | Complete — passing |
| axe-core audits (scenario, job aid; Pages pages post-publish) | Complete — 0 critical/serious |
| Simulated learner runs (API pipeline) | **PENDING: requires API key** |
| Multi-model review panel (API pipeline) | **PENDING: requires API key** |
| Reviewer cognitive walkthrough + heuristic evaluation (reviewer agent) | **PENDING** — orchestrated by the portfolio owner; form ready in `evaluation/human-protocol/structured-review-form.md` |
| Human usability sessions (n ≥ 3) | Not run — protocol ready in `evaluation/human-protocol/` |
| VoiceOver testing | Not performed (Guidepup automation unsupported on build machine's macOS); manual check protocol provided |

## How to run the pending evaluations

1. Copy `.env.example` to `.env` and fill in at least `MODEL_A_*` and `MODEL_B_*` (OpenAI-compatible endpoints).
2. `npm run eval:dry-run` to verify the pipelines end-to-end with stub data (writes to `dry-run/`).
3. `npm run eval:pending` to run the simulated learner runs and the review panel. Results land in `evaluation/simulation-results/` and `evaluation/panel-results/`; `evaluation/results.md` is updated by the pipelines.
4. Update the evaluation-status line in `README.md` and the tables in `evaluation/METHODS.md` from the run summaries.

## Publish checklist (2026-10-25)

- [x] gitleaks clean; no `.env` in history; no files > 50 MB
- [x] axe audits clean (0 critical/serious)
- [x] Link check clean (local relative-link check pre-publish; full crawl post-publish)
- [x] Scripted scenario tests pass
- [x] Pipelines verified via `--dry-run`; placeholder `.env` exits with code 1 and no network calls
- [x] Numbers consistency check (22% turnover, 31% one-on-one rate, 2.4/5 pulse) across intake, CSV, analysis, dashboard, measurement plan
- [x] Public repo created; Pages enabled from `main` `/docs`; build green
