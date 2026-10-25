---
title: "Root-cause analysis (Gilbert's BEM)"
parent: "3. Analysis"
nav_order: 2
---

# Root-cause analysis with Gilbert's Behavior Engineering Model

Thomas Gilbert's Behavior Engineering Model sorts the forces that shape performance into six cells: three about the **environment** (information, resources, incentives) and three about the **individual** (knowledge, capacity, motives). Its central claim — that environmental factors usually outweigh individual ones — is exactly the test to run on a "we need feedback training" request.

> Method note: each cell below states a Brightline cause **with its evidence source** from discovery ([interviews](../02-discovery/interview-notes-simulated.html), [survey analysis](../02-discovery/survey-analysis.html), [document review](../02-discovery/document-review.html)). All evidence is simulated, constructed for portfolio purposes.

## The BEM table

The six cells use Gilbert's own labels. The case carries **four primary causes** — **E-2**, **P-1/P-2**, **S-1**, **M-4** (the same IDs the [is-it-training verdict](is-it-training.html) uses); supporting evidence is listed inside each cell rather than given its own ID.

### Environment — the three environmental cells

| **Information** (what people need to know/see) | **Resources** (time, tools, processes) | **Incentives** (payoffs, consequences) |
|---|---|---|
| **E-2, definition gap.** No definition or expectation of regular one-on-ones; policy says only "encouraged". *Evidence: HR-P-014 document review; M3 never saw it; HR1 confirms it is untracked.* <br><br> **P-1/P-2, the form.** The annual review form collects ratings only, with an optional comments box — no place to record behavior, impact, or agreed actions. *Evidence: form review; S1, M2; HR1.* | **E-2, primary.** One-on-ones are not scheduled; no template; no rostered time; spans of 12–18 direct reports (median 13) make informal contact impossible. *Evidence: M1, M3; org chart extract; document review; survey Findings 2 & 4.* <br><br> **P-1/P-2, the cadence.** No qualitative feedback point anywhere in the year; the annual review is the only formal one. *Evidence: S1, M2; document review.* | **M-4.** Scorecards measure throughput only (0% weight on team development); feedback work is invisible and unrewarded. *Evidence: scorecard document review; M1, M2, M3; HR1.* |

### Individual — the three individual cells

| **Knowledge** (knowing how) | **Capacity** (being able) | **Motives** (what the person wants) |
|---|---|---|
| **Cause S-1 — the one training can address.** Some managers (especially the newest) don't know how to *structure* a feedback conversation or open a hard one. *Evidence: M1 (public, vague feedback; has avoided 1:1s); M2 — an 11-year veteran who equates task direction with feedback while his team rates useful feedback 2.1/5 ([survey Finding 1](../02-discovery/survey-analysis.html): the 1.5-pt structure gap dwarfs the 0.3-pt tenure gap, Finding 3); HR1 (new managers get no people-management support). The evidence base is the thinnest of the four causes — one interview directly plus two corroborating sources — which is why the training slice it justifies is deliberately narrow.* Also in this cell: **new managers want support** (M1 asked for a management course; waitlisted to next year) — a missing-support problem, really an environment gap, not a knowledge deficit. | **No deficit (checked and ruled out).** Managers can describe good feedback and want to do it. Spans create workload pressure (workload 3.25/5), which is logged as an environment issue above, not an individual-capacity one. *Evidence: M2, M3, M1.* | **Motives face of M-4.** Giving hard feedback carries social risk with no upside (no recognition; can conflict with throughput pressure). *Evidence: M1 ("hard, they used to be my colleagues"); HR1; scorecard.* |

Cause-ID mapping (for readers cross-referencing earlier drafts or the discovery artifacts): *E/P-1 → E-2, definition gap; P-2 and P-1b → P-1/P-2 (form and cadence); S-2 → the support note inside the S-1 cell; C-0 → "no deficit (ruled out)"; M-4b → the motives face of M-4.*

## What the model says

- All three environmental cells carry a cause; the individual side carries exactly one narrow knowledge gap (S-1) plus a support need that is really a missing environment resource. That is the shape the model predicts for a "we need training" request: the environment outweighs the individual.
- In Gilbert's terms, Brightline's largest deficits are **information** (no expectations, no definitions), **resources** (no time, template, or process) and **incentives** (scorecard misalignment). The **knowledge** cell is real but small and specific: structuring and opening difficult feedback conversations — the new-manager cohort feels it most (35% of managers, promoted in the last 18 months).
- That pattern is why the recommendation in [section 4](../04-solution/index.html) is a **blend**: fix the environment and process first, support the conversation with a job aid, and use a short scenario to build the one skill training *can* build. A 2-hour course would touch only the S-1 slice — roughly the difference between the 2.3 and 2.6 tenure means, not the 1.9-to-3.4 structure gap.

## Alternative explanations considered and set aside

| Hypothesis | Evidence for | Verdict |
|---|---|---|
| "It's the wave of new managers" (HR's intake theory) | 35% promoted in 18 months; new managers slightly less confident | **Partly.** Tenure gap is 0.3 points vs 1.5 for structure; new-manager cadence rate ≈ veteran rate. Training only new managers would miss most teams. |
| "Staff don't want feedback" / engagement is generational | No supporting evidence in any source | **Set aside.** Staff describe exactly what useful feedback looks like (S1's clinical-educator story). |
| "It's a workload problem — clinics are understaffed" | Workload 3.25/5, mild team-size correlation | **Contributing, not causal.** Feedback happens inside work, not after it; the constraint is structure and time allocation, not headcount. |
| "Cedar Point proves meetings don't help" (nihilistic read) | Cedar: 4.3/5 meeting frequency, 1.5/5 usefulness | **Inverted.** Cedar is the strongest evidence that *content* (structure) matters more than frequency. |

Next: the [Mager & Pipe flow](mager-pipe-flowchart.html) runs the same evidence through a decision procedure, then [is-it-training](is-it-training.html) gives the verdict per cause.
