---
title: "Survey data README (simulated)"
parent: "2. Discovery"
nav_order: 3
---

# Survey data README — column dictionary and generation method

> **Simulated data constructed for portfolio purposes.** Brightline Health Services is a fictional organization. The file `survey-data-simulated.csv` contains no real responses; every value was constructed by the script described below, designed so the dataset demonstrates the discovery patterns of the case study.

## What the survey is (in the fiction)

A pulse survey fielded during discovery (2026-09), sampling **200 respondents** across the 12 regional clinics: **130 staff** (people who receive feedback) and **70 people managers** (people who give it). It complements the [interviews](interview-notes-simulated.html) and [document review](document-review.html).

## Column dictionary

| Column | Applies to | Meaning |
|---|---|---|
| `respondent_id` | all | `S001–S130` (staff), `M001–M070` (managers) |
| `sample` | all | `staff` or `manager` |
| `clinic` | all | One of the 12 fictional regional clinics |
| `role` | all | Staff: Registered Nurse, Medical Assistant, Front Desk, Allied Health, Clinic Admin. Managers: People Manager |
| `tenure_band` | all | Respondent's own tenure at Brightline: `<1 yr`, `1-3 yrs`, `3-10 yrs`, `>10 yrs` (managers: blank in this extract) |
| `manager_tenure_band` | all | Tenure of the respondent's manager (staff) or the manager's own tenure (managers): `<1 yr`, `1-5 yrs`, `>5 yrs` |
| `team_size_band` | all | Size of the respondent's team: `12-13`, `14-15`, `16-18` (spans per the org chart extract) |
| `regular_1on1s` | staff | Does the respondent have a one-on-one with their manager at least every two weeks? `yes`/`no` |
| `likert_1on1_freq` | staff | 1–5: how often a one-on-one happens — 1 = never, 2 = rarely, 3 = monthly, 4 = fortnightly, 5 = weekly or more |
| `likert_feedback_freq` | staff | 1–5: how often the respondent receives feedback on their work — same scale |
| `likert_feedback_useful` | staff | 1–5: **the pulse item** — "I received useful feedback in the last two weeks" (strongly disagree … strongly agree). Baseline metric |
| `likert_workload` | staff | 1–5: workload manageability (1 = unmanageable, 5 = comfortable) |
| `mgr_1on1_cadence` | managers | Self-reported cadence of one-on-ones the manager holds: `Weekly or more`, `Every two weeks`, `Monthly`, `Rarely`, `Never` |
| `mgr_pct_1on1s_structured_feedback` | managers | Self-reported share (0–100) of the manager's one-on-ones that include structured feedback (specific behavior + impact + agreed next step) |

## How it was generated (full method)

The file is produced by [`scripts/generate-survey.mjs`](https://github.com/iwyusdaz/should-this-be-a-course/blob/main/scripts/generate-survey.mjs) and is **byte-identical on every run**:

1. **Deterministic PRNG.** A mulberry32 generator with fixed seed `20261025` drives every random choice. `Math.random` is never used.
2. **Group profiles.** Each of the 200 rows receives a designed profile: clinic (weighted counts per clinic), role, tenure bands, team-size band.
3. **Designed correlations.** Each staff Likert item is assigned by *sorted assignment*: rows are ranked by a propensity score that encodes the discovery patterns (regular one-on-ones and smaller teams rank higher on feedback usefulness; manager tenure has only a weak effect; the Cedar Point rows are deliberately penalized), then the exact calibrated marginal counts are poured over the ranked rows.
4. **Exact baselines.** The marginals are calibrated so the locked case numbers hold exactly:
   - mean of `likert_feedback_useful` (staff) = **2.40/5** — the pulse baseline;
   - **22 of 70** managers (31%) report a fortnightly-or-better one-on-one cadence;
   - mean of `mgr_pct_1on1s_structured_feedback` ≈ **20%** — "structured feedback in about 1 in 5 one-on-ones";
   - 45 of 130 staff (35%) report regular one-on-ones (staff-side view of the same reality, with sampling noise).
5. **Designed wrinkles** (per the case plan: "add noise and contradictions; include one finding that doesn't fit"):
   - **Cedar Point:** all 12 staff report frequent one-on-ones (mean 1:1 frequency 4.3/5) yet score **lowest** on feedback usefulness (1.5/5); its managers meet weekly but report almost no structured-feedback content. Meetings are not the same as feedback.
   - **The Glenrose outlier:** one brand-new manager reports a fortnightly cadence and 55% structured content — experience is not the deciding variable.
6. **Reproducibility check.** Run `node scripts/generate-survey.mjs --verify` — the script recomputes the statistics and exits non-zero if any locked value drifts.

## What this dataset is for — and what it can't do

- It can illustrate how the discovery evidence was assembled and analyzed (see the [survey analysis](survey-analysis.html)).
- It cannot show anything about real organizations; it was constructed to support the case narrative. The correlations are designed, not discovered — that is disclosed so the analytic *method* (segmenting by structure, not blaming experience) can be judged on its own merits.
