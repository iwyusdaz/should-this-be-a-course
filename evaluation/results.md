---
title: "Evaluation results"
search: exclude
---

# Evaluation results

> **Agent-simulated, single model.** Both results below come from one AI agent working inside the build environment on 2026-11-11, with no API calls and no human participants. The personas and reviewers are roles that agent played. They are not learners, not experts, and support no learning-gain or endorsement claims. The originally planned cross-model blind design could not be reproduced; see [METHODS.md](METHODS.md) for the method and its limits.

## Agent-simulated learner runs

8 runs: 4 personas ([personas.json](personas.json)) × 2 prior-knowledge conditions (`none`, `job-aid`). Raw choices, in-character reasons and reflections: [agent-simulated/simulation-runs.json](agent-simulated/simulation-runs.json).

Revision rule: a decision point is flagged when more than 75% of runs pick the same option.

| Decision point | Strong | Realistic mistake | Avoidant | Most common share | Flag (>75%) |
|---|---|---|---|---|---|
| 1. Opening | 4 | 3 | 1 | 50% (strong) | No |
| 2. Pushback | 5 | 2 | 1 | 62.5% (strong) | No |
| 3. Closing | 4 | 2 | 2 | 50% (strong) | No |

By prior-knowledge condition (4 runs each; reported for context, the rule applies to the pooled view):

| Decision point | `none` | `job-aid` |
|---|---|---|
| 1. Opening | mistake 3, avoidant 1, strong 0 (75%) | strong 4 (100%) |
| 2. Pushback | mistake 2, strong 1, avoidant 1 (50%) | strong 4 (100%) |
| 3. Closing | avoidant 2, strong 1, mistake 1 (50%) | strong 3, mistake 1 (75%) |

Endings reached: Improved 3, Unresolved 3, Escalated 2 (all three endings reached).

**What the runs suggest (design-probing only):**

1. No decision point crossed the 75% flag pooled, so the repo's own rule calls for no revision.
2. Without the job aid, the general-complaint mistake in Decision 1 drew 3 of 4 runs (exactly 75%). The mistake is attractive, which is the intent.
3. With the job aid, Decisions 1 and 2 went 4 of 4 to the strong option. The job aid prints the D1 opener ("What's your take?") and the D2 strong line almost word for word, so this condition tests recognition of the script more than judgment. That is the intended transfer, but it is not evidence that the options are balanced.
4. Two personas named Decision 3's strong option as matching the template prompts in the scene, and one named Decision 2's strong option as longer and "training-course language". The review panel below records the same tells.

## Agent-simulated review panel

3 reviewer roles (learning design; performance consulting and measurement; accessibility and clarity), all played by the same single agent, each rating the rubric items its packet covers on the 11-item [structured review form](human-protocol/structured-review-form.md). Full record: [agent-simulated/review-panel.md](agent-simulated/review-panel.md).

| Rubric item | Role | Rating |
|---|---|---|
| 1. Intake reframes before solutioning | R2 | pass |
| 2. Every cause has cited evidence | R2 | pass |
| 3. Analysis would survive expert scrutiny | R2 | pass |
| 4. Proposal is business-ready | R2 | concern |
| 5. Action map ties activities to behavior | R1 | pass |
| 6. No obviously right scenario option | R1 | concern |
| 7. Consequence-based feedback | R1 | pass |
| 8. Measurement plan holds up | R2 | pass |
| 9. Accessibility baseline met | R3 | pass |
| 10. Simulated material clearly labeled | R3 | pass |
| 11. A first-time reader can follow it | R1 | pass |

Agreement: not reported. With one model, there is no second rater to agree with, so percent agreement and Cohen's κ are not applicable.

Open findings: 3 medium and 5 low, none fixed in this round. They are listed with suggested changes in [agent-simulated/review-panel.md](agent-simulated/review-panel.md#open-findings).
