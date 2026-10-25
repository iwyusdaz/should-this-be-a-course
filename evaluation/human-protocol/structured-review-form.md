# Structured review form

One form, three uses — so the results are comparable across reviewers:

1. **Agent review** — a reviewer agent (fresh context, did not build the repo) completes this form. Labeled "Agent review" wherever it appears; never "educator review", "expert feedback", or "peer review".
2. **Multi-model AI review panel** (pending) — `evaluation/run-review-panel.mjs` sends the same rubric to ≥2 models in 3 reviewer roles and reports agreement + Cohen's κ.
3. **Human review** — an experienced practitioner may complete the same form (with permission, their role is stated but the review is still one person's opinion).

**Reviewer instructions.** You are reviewing a portfolio case study built on **simulated data** (fictional organization, constructed for portfolio purposes). Judge the craft and the honesty of the artifacts — not whether the organization is real. For each item give a rating and one or two sentences of justification:

- **pass** — solid as is
- **concern** — usable, but has a real weakness a stakeholder would notice
- **fail** — materially wrong, missing, or misleading

Then list open findings (severity, artifact, issue, suggestion) and an overall assessment.

## Rubric

| # | Item | Rating | Justification |
|---|---|---|---|
| 1 | **Intake reframes before solutioning.** The intake artifacts capture the request verbatim and reframe it into a business problem before any solution is chosen. | pass / concern / fail | |
| 2 | **Every cause has cited evidence.** Each claimed root cause is supported by cited evidence from the discovery artifacts. | pass / concern / fail | |
| 3 | **Analysis would survive expert scrutiny.** The BEM and Mager & Pipe reasoning is applied correctly. | pass / concern / fail | |
| 4 | **Proposal is business-ready.** Leads with the recommendation, business tone, roughly two pages. | pass / concern / fail | |
| 5 | **Action map ties activities to behavior.** Every activity maps to an observable behavior and the business goal; no content-dump activities. | pass / concern / fail | |
| 6 | **No obviously right scenario option.** At no decision point is one option obviously correct; the mistakes are attractive. | pass / concern / fail | |
| 7 | **Consequence-based feedback.** The scenario gives feedback through consequences and reactions, not "correct/incorrect" labels or scores. | pass / concern / fail | |
| 8 | **Measurement plan holds up.** Leading/lagging indicators tie to the business goal, plausible isolation design, confounds named. | pass / concern / fail | |
| 9 | **Accessibility baseline met.** Charts have takeaway alt text + data tables; diagrams have text summaries; keyboard/focus evidence matches claims. | pass / concern / fail | |
| 10 | **Simulated material clearly labeled.** All fictional/simulated material is labeled; AI evaluation is labeled by method. | pass / concern / fail | |
| 11 | **A first-time reader can follow it.** The thread request → discovery → analysis → solution → measurement is followable without getting lost. | pass / concern / fail | |

## Open findings

| Severity (high/med/low) | Artifact / page | Issue | Suggested change |
|---|---|---|---|
| | | | |

## Overall assessment

(2–3 sentences: strongest and weakest aspects from your perspective.)

## Reviewer metadata (required for the record)

- Reviewer type: agent / model panel / human
- For agents and models: name and version of the model or agent, date, temperature/settings if applicable
- For humans: role and years of experience (name only with explicit permission)
- Same-model disclosure: agents and models may share a model family with the authoring agent; reviewers should note this as a limitation of their own review.
