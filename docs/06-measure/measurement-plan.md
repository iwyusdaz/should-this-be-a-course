---
title: "Measurement plan"
parent: "6. Measurement and testing"
nav_order: 1
---

# Measurement plan

Everything here ties back to one business goal: **reduce 90-day new-hire turnover from 22% to 15% within 12 months** (see the [performance gap](../03-analysis/performance-gap.html)). Completion rates are tracked only as a sanity check — they are not outcomes.

> All baseline values are **simulated** (constructed for portfolio purposes); the design is what's being demonstrated. In a real engagement, the baseline comes from HRIS and the pulse survey.

## Indicators

| Type | Metric | Source | Baseline (simulated) | Target | When |
|---|---|---|---|---|---|
| Leading | % of managers holding one-on-ones at least every two weeks | Calendar audit (sampled) + manager self-report | **31%** (22 of 70) | **80%** | Monthly |
| Leading | Scenario completion + debrief reflection submitted | Scenario log + one-question reflection | n/a (new) | **90% of managers** | 6 weeks post-launch |
| Leading | Job aid usage (one-on-ones where the structure was used, manager self-report) | 30-day challenge tracker | n/a (new) | 60% | 30 days, then quarterly |
| Behavior | Staff pulse item: *"I received useful feedback in the last 2 weeks"* (1–5) | Quarterly pulse survey | **2.4/5** (n=130) | **3.5/5** | Quarterly; reach 3.5 within 2 quarters |
| Behavior | Staff reporting a regular fortnightly 1:1 | Pulse survey | 35% (45 of 130) | 60% | Quarterly |
| Lagging | 90-day new-hire turnover | HRIS | **22%** (17 of 78) | **15%** | 12 months (reported quarterly) |
| Guardrail | Clinic throughput (patients/day) and wait-time variance | Ops dashboards | current levels | no deterioration | Monthly |

The guardrail row matters politically: this intervention asks managers to spend time on people. If throughput degrades, the blend loses leadership support — so it is measured, not assumed away.

## Isolating the contribution: staggered rollout

Clinic-level change alone can't prove the blend caused it. The rollout is staggered so unrolled clinics act as a comparison group:

- **Wave 1 (month 1):** 6 clinics — the two with the worst 90-day turnover plus the two best, plus two middle performers.
- **Wave 2 (month 3):** the remaining 6 clinics.

**Read-outs:** compare the change in each indicator between waves (difference-in-differences). If Wave 1 clinics move on the leading and behavior indicators before Wave 2 clinics do — and the gap closes when Wave 2 launches — the blend is the most plausible explanation. The [survey analysis](../02-discovery/survey-analysis.html) shows why clinic-level comparison is meaningful (clinic correlates with structure, which is exactly what the blend changes).

**Sample honesty:** 12 clinics is 12 clusters; the comparison is directional evidence, not a trial. With 70 managers, monthly cadence percentages move in steps of ~1.4 points per manager — report confidence intervals or at minimum the raw counts, never bare percentages alone.

## Confounds — named in advance

| Confound | Why it matters | Mitigation |
|---|---|---|
| Labor market shifts | A tightening market lifts turnover everywhere (or a slump masks gains) | Track the regional health-care vacancy rate alongside; compare waves |
| Pay changes | The 2026 award review lands mid-year | Log the date; test whether turnover moved at the pay event, not the intervention |
| Clinic leadership changes | New managers reset everything at once | HRIS change log; exclude clinics with manager changes from the primary comparison |
| Seasonality | Flu waves distort rosters and turnover in winter | Use year-over-year comparisons for the same quarter |
| Hawthorne effect | Managers behave better while observed in wave 1 | The behavior indicator runs a full year; the 6- and 12-month read-outs matter more than month 1 |

## Review cadence

| When | What happens | Who |
|---|---|---|
| Monthly (months 1–6) | Cadence % + guardrails; flag clinics below 60% cadence to ops directors | L&D + HR |
| 6 weeks | Scenario completion + reflection themes; first pulse read | L&D |
| Quarterly | Full pulse + turnover vs. comparison group; steering decision: continue / adjust / stop | COO + HR + L&D |
| 12 months | Primary read-out: 90-day turnover vs. 15% target; write-up goes to the board | COO |

**Pre-registered stop/adjust rule:** if at 6 months the cadence indicator is ≥ 70% but the pulse item has not moved at least +0.4, the problem is content (the meetings happen but aren't working — the [Cedar Point pattern](../02-discovery/survey-analysis.html)), and the fix is coaching on the template, not more pressure on cadence.

## What this plan can and cannot show

- **Can:** whether the leading indicators move; whether behavior change precedes the turnover change in the wave order the blend predicts; whether turnover and guardrails move together.
- **Cannot (simulated case):** anything real — there was no deployment. The baselines were constructed for portfolio purposes. Even in a real run, a 12-clique staggered rollout is evidence, not proof; attribution would stay qualified.
