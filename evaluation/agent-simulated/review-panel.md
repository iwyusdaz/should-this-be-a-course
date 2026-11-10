# Agent-simulated review panel, 2026-11-11

> **Label: agent-simulated review, single model.** One AI agent (the Kiro workflow agent, one model) played all three reviewer roles in turn, inside the build environment, with no API calls, no second model and no human reviewer. This is not educator review, expert feedback or peer review. The original design (three roles × at least two different models, with agreement and Cohen's κ between models) could not be reproduced, so **no agreement statistic is reported**: one model rating its own way three times is not inter-rater agreement.

**Rubric:** the 11-item [structured review form](../human-protocol/structured-review-form.md) (pass / concern / fail).
**Same-model limitation:** the reviewing agent may share a model family with the agent that built the artifacts, and it is the same agent that played the simulated personas in [simulation-runs.json](simulation-runs.json). It did not author the reviewed artifacts in this round.
**Repo state reviewed:** commit `6101ae0` (the published v1.0.0 content). Each role read its packet in full (no truncation).

## Role packets and ratings

Each role rated only the rubric items its packet covers; items outside a packet are not rated by that role.

| Role | Packet | Items rated |
|---|---|---|
| R1 Learning design reviewer | `docs/04-solution/action-map.md`, `docs/05-build/scenario-design.md`, `src/scenario.twee`, `docs/05-build/30-day-challenge.md` | 5, 6, 7, 11 |
| R2 Performance consulting and measurement reviewer | `docs/01-intake/intake-form-completed.md`, `docs/03-analysis/root-cause-bem.md`, `docs/03-analysis/is-it-training.md`, `docs/04-solution/stakeholder-proposal.md`, `docs/06-measure/measurement-plan.md` | 1, 2, 3, 4, 8 |
| R3 Accessibility and clarity reviewer | `docs/02-discovery/survey-analysis.md`, `docs/02-discovery/survey-data-readme.md`, `docs/05-build/scenario-design.md`, `docs/06-measure/usability-test-report.md` | 9, 10 |

| # | Item | Role | Rating | Justification |
|---|---|---|---|---|
| 1 | Intake reframes before solutioning | R2 | **pass** | Request is quoted verbatim; three reframing questions move it to 90-day turnover before any solution, and the written "analyze first" agreement is recorded. |
| 2 | Every cause has cited evidence | R2 | **pass** | All four causes (E-2, P-1/P-2, S-1, M-4) cite interviews, survey findings or document review. S-1 is thin, and the BEM cell says so. |
| 3 | Analysis would survive expert scrutiny | R2 | **pass** | BEM uses Gilbert's six cells correctly, and alternative explanations are tested and set aside with reasons. The Mager & Pipe page was outside this packet. |
| 4 | Proposal is business-ready | R2 | **concern** | Leads with the recommendation and the turnover cost math checks out (17 × $9,400 ≈ $160k; 7 points × 78 ≈ 5 to 6 exits). But its 1:1 length is inconsistent (15 min in component 1, 20 min in the recurring-time row), and the course-hours figure disagrees with is-it-training.md (see findings). |
| 5 | Action map ties activities to behavior | R1 | **pass** | Four observable actions, each with a "why not now" and a fix; practice exists only for the skill action; the excluded content is named. |
| 6 | No obviously right scenario option | R1 | **concern** | After the 2026-10-26 rebalancing, D1 is balanced. D2's strong option is 34 words against 11 and 18. In D3 the strong option is still last, the longest, and repeats the two template prompts printed in the scene. The simulated runs did not cross the 75% flag, but personas named both tells. |
| 7 | Consequence-based feedback | R1 | **pass** | Feedback arrives through Priya's and the unit's reactions; the score is hidden and no "correct/incorrect" label appears before the debrief. |
| 8 | Measurement plan holds up | R2 | **pass** | Leading, behavior and lagging indicators tie to the turnover goal; staggered rollout with named confounds and a pre-registered stop/adjust rule. One typo ("12-clique"). |
| 9 | Accessibility baseline met | R3 | **pass** | Every chart has takeaway alt text plus a data table; the diagram has a text summary; keyboard and focus claims match the scripted test results. |
| 10 | Simulated material clearly labeled | R3 | **pass** | Every packet artifact carries a simulated-data label; the survey README discloses that correlations were designed. |
| 11 | A first-time reader can follow it | R1 | **pass** | The scenario and design doc follow the case thread; two small timeline slips (see findings) do not block understanding. |

**Totals:** 9 pass, 2 concern, 0 fail.

## Open findings

None of these were fixed in this round. They are recorded for the owner to decide on.

| Severity | Artifact | Issue | Suggested change |
|---|---|---|---|
| Medium | `docs/03-analysis/is-it-training.md` vs `docs/04-solution/stakeholder-proposal.md` | is-it-training point 4 says the course costs "~1,400 manager-hours (70 managers × 2 h × multiplier)"; the proposal's cost table says 140 h sitting, about 210 h with scheduling drag. 1,400 would need a 10× multiplier. | Use the proposal's 140 h / ~210 h figure in is-it-training.md. |
| Medium | `docs/04-solution/stakeholder-proposal.md` | Component 1 and the action map define 15-minute fortnightly 1:1s, but the recurring-time row computes 13 × 20-minute fortnightly 1:1s ≈ 2.2 h/week. At 15 minutes it is about 1.6 h/week. | Pick one length and recompute the row. |
| Medium | `src/scenario.twee`, Decision 3 (and Decision 2) | D3's strong option restates the scene's template prompts ("one piece of specific feedback", "next step + book the next one") and stays last and longest; D2's strong option is about twice the length of the others. | Shorten the D2 strong line; reword the D3 template prompts or the strong option so they don't match word for word. |
| Low | `src/scenario.twee`, Decision 1 | The scene is set on a Monday and the strong option says "Yesterday's evening handover", but the follow-up passage refers to "Thursday's sheet". | Make the day consistent. |
| Low | `docs/05-build/scenario-design.md` | Says the scenario "covers the two weeks", but the story runs from Monday through "two weeks later", a later one-on-one and "four weeks later". | Describe the span as about six weeks, or drop the duration. |
| Low | `docs/04-solution/stakeholder-proposal.md` | The cost table's "Skill only (cause 4)" uses a numbering that collides with the M-4 cause ID used elsewhere; the skill cause is S-1. | Write "Skill only (S-1)". |
| Low | `docs/06-measure/measurement-plan.md` | "a 12-clique staggered rollout" | "a 12-clinic staggered rollout". |
| Low | `docs/02-discovery/survey-analysis.md`, Finding 3 | The sentence "new managers are slightly more likely than veterans to report ... (8 of 25, 32%) than managers over 5 years (7 of 25, 28%)" has a doubled comparison. | Remove "than veterans". |

## Overall assessment (agent-simulated, single model)

The strongest part is the traceability chain: every cause carries cited simulated evidence into a fix with an owner, and the measurement plan ties back to the same turnover number. The weakest part is a pair of cost-logic inconsistencies between the analysis and the proposal, plus residual tells in Decisions 2 and 3 of the scenario. These are one model's opinions and need human review before they count as expert judgment.
