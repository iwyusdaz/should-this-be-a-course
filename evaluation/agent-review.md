# Agent review — should-this-be-a-course

**Reviewer:** separate AI reviewer agent (fresh context), 2026-10-26. Limitation: the reviewer may share the same underlying model as the author. This is not human or educator review.

**Method label (per `evaluation/METHODS.md` method 5):** Agent review — cognitive walkthrough + heuristic evaluation (Nielsen's 10) + structured review form, performed against the **live site** (https://iwyusdaz.github.io/should-this-be-a-course/) and the repository at commit state 2026-10-26. The reviewer did not build the repo.

---

## 1. What the reviewer independently verified

| Probe | Result |
|---|---|
| Live URLs (home, scenario, job aid HTML, job aid PDF, CSV, measurement plan, what-we-won't-build) | All HTTP 200; live scenario HTML byte-identical to the repo build |
| Scenario played to **all three endings** on the live site (Playwright, fresh sessions) | Avoidant path → "Ending — Escalation"; mistake path → "Ending — Quietly stuck"; strong path → "Ending — The problem, handled". 11 link activations to reach the debrief on every path (matches the repo's claimed step count). Zero page errors on any path. |
| Keyboard spot-check (live scenario) | From passage load, 1 Tab reaches the first choice link; Enter activates it; **focus lands on the new passage's `h2` after every choice and on first load** (verified on all three paths, `focusIsHeading=true` at every decision and the debrief). No keyboard trap observed. |
| axe-core audits (tooling/audit-axe.mjs → /tmp/review02-axe) | Home: 0 violations (1 *incomplete* — the theme's active-nav-link contrast, matching the builder's disclosure). Scenario: 0 violations. Job aid: 0 violations. |
| Numbers consistency | `npm run check:consistency` re-run by the reviewer: **PASSED** (22% / 31% / 2.4/5 verified against the regenerated CSV and across intake, analysis, dashboard, measurement plan, README). Manual spot-checks in 6 files agree (17 of 78; 22 of 70; 45 of 130). |
| Claims vs. reality spot-checks | Mermaid text summary present under the Mager & Pipe diagram on the live page; chart alt text carries takeaways; PDF (235 KB) and CSV serve correctly. One claim found **false** (see Finding 6). |

## 2. THE KEY CHECK — is any scenario option obviously right?

**Verdict: Decision 1 and Decision 2 telegraph the strong option; Decision 3 is well balanced.** This matters because `scenario-design.md` asserts "No option announces itself as correct (final quality check: no obviously right option)," and the plan's final checklist has the same item. The structural tells:

- **The strong option is last in all three decisions** (verified in the live DOM and in `src/scenario.twee`).
- **It is always the longest**, and in D3 it is written as a complete procedure ("give X, ask Y, agree Z, book W") while the others are single moves.
- **It is the only option never followed by an em-dash gloss.** D1-A's gloss ("keep it light, see if she raises it herself") is self-defeating; D1-B's ("be direct, show it's serious") and D2-B's ("hold the line on the rule") are the genuinely attractive mistakes. The un-glossed third option reads as "the clean one."
- The strong option **demonstrably enacts the job-aid model** (specific moment + "What's your take?"), so anyone who has seen the job aid — one of the two planned persona conditions — will recognize it instantly.
- The narrative rewards D1-Strong with the story's biggest reveal ("You did not know any of that." — the broken evening sheets), which is legitimate consequence feedback but reinforces the tell on replay.

Per decision:

| Decision | Option 1 | Option 2 | Option 3 (strong) | Assessment |
|---|---|---|---|---|
| 1. Opening | Small talk — near-strawman for anyone but the most conflict-avoidant; the gloss undercuts it | General complaint ("we've had complaints… starting today") — **genuinely attractive** for a new manager told to "be direct" | Specific moment + open question | **Telegraphed.** Options 1–2 are live candidates; option 3 is discoverable without reading the scene |
| 2. Pushback | Apologise and withdraw — attractively justified ("she's earned the benefit of the doubt") | "…I need you to comply." — the gloss is attractive but the quoted dialog is **borderline strawman** (nobody says "comply") | Acknowledge + hold the safety line + ask | **Telegraphed**, mainly by position/length; option 2's dialog needs de-caricaturing |
| 3. Closing | Cancel ("she's exhausted, she'll understand") — **genuinely tempting** | Compliment sandwich ("keep it positive") — **genuinely tempting** (a real, widely-held myth) | Specific feedback + next step + booked 1:1 | **Best-balanced decision**; strong is still last/longest, but the mistakes compete |

Prediction the owner can test: the pending >75%-same-choice simulation will most likely flag **D1 (option C)** pooled, and D2 for the `job-aid` prior-knowledge condition.

**Concrete rewording (suggested):**

1. **Vary the strong option's position**: put it first in D1, second in D2 (or wherever the flow best hides it). Fixed order per decision is fine; what must change is the pattern.
2. **Equalize the glosses** — either strip the em-dash glosses from all options and let the dialog carry them, or give every option a matter-of-fact gloss (e.g., D1-Strong: "— get specific, then ask"). The asymmetry is the tell.
3. **Trim D1-Strong** so it isn't conspicuously the longest: *"Priya — got five minutes? Yesterday's evening handover was missing the allergy line. What's your take?"* keeps the skill while dropping the scaffolding.
4. **De-strawman D2-Option 2**: *"I hear you. But handover completeness is a hard requirement — it's patient safety. I need those sheets complete."* This keeps the policy-first mistake attractive without the robotic "comply."
5. D3 needs only the gloss fix (or nothing).

These are wording/order changes in `src/scenario.twee` + a rebuild; the debrief's explicit strong/mistake/avoidant labels are fine as post-hoc teaching and need no change.

## 3. Evidence → cause → solution chain

Traced end-to-end (all citations resolve to real artifacts in the repo):

- **Cause E-2 (environment: 1:1s not scheduled, spans 12–18)** — strongest chain. Intake (discovery access, calendar audit approved) → interview M1 (no slot in the week) and M3 (18 reports, arithmetic of a "part-time job") → document review (policy HR-P-014 "encouraged", spans median 13, the 2.2 h/week calculation) → survey Findings 2 & 4 → BEM cell with sources → fix (cadence + template + rostered time, owner Ops/COO) → measurement (31% → 80% cadence). The builder's own "add a calendar-audit artifact" next-step note is apt; the sampled-audit citation is currently doing light duty.
- **Cause M-4 (incentives: scorecard 0% team development)** — strong chain. Scorecard document (weights table) → M1/M2/M3 all describing it from memory → HR1 naming it and who owns it → fix flagged as a COO decision the consultant cannot make → honest "what if it stalls" row in the proposal risks table.
- **Cause S-1 (skill)** — **thinnest evidence**, though honestly scoped: one interview (M1's vague, public feedback; avoidance) plus indirect survey inference (structure gap 1.5 pts vs tenure gap 0.3). The narrowness of the recommended training slice is proportionate to the evidence, and the "alternative explanations considered" table defends it — but a skeptic will note that the one cause justifying *any* training rests mainly on n=1 interview. Consider one more simulated data point (e.g., a manager-survey self-efficacy item or a second interview showing a failed feedback attempt).
- **Cause P-1/P-2 (process: ratings-only annual review)** — well evidenced (form review + S1 + M2 + HR1) and the fix (2 qualitative questions) is the cheapest possible response to it.

**Is the BEM mapping forced?** Partly. Two presentation problems (not reasoning problems):

1. The table's **individual row reuses the environment column labels** (Information/Resources/Incentives) instead of Gilbert's Knowledge/Capacity/Motives. S-1 is a knowledge cause sitting under a column headed "Information". The prose calls it "the knowledge cell," so the author knows the distinction — the table just doesn't show it. Relabeling the individual row's columns fixes this cleanly (Knowledge=S-1/S-2, Capacity=C-0, Motives=M-4b).
2. **Cause-ID sprawl**: the BEM page introduces nine IDs (E/P-1, E-2, P-2, P-1b, S-1, S-2, C-0, M-4, M-4b) for what the rest of the case calls "four causes" (is-it-training uses E-2, P-1/P-2, S-1, M-4). A reader tracking four causes meets nine labels. Also "Four of the six environmental cells carry a cause" is a miscount (the model has six cells total, three of them environmental — all three carry causes). Suggest: four primary cause IDs, sub-evidence listed inside each cell.

## 4. The proposal — would a skeptical COO buy the cost logic?

Mostly yes: it leads with the recommendation, quantifies the turnover cost, names what it needs from each leader, and pre-empts the "less training = doing less" read. Two vulnerabilities:

- **The cost table omits the blend's recurring manager time.** "Manager time: 140 hrs sitting + scheduling drag ≈ 210 hrs" vs "~90 min each ≈ 105 hrs, spread over 30 days" counts only briefing + scenario + challenge. The blend's own component 1 — fortnightly 15-minute 1:1s with every report — costs, at the repo's own median span of 13 and the document-review's arithmetic, ~2 hours/manager/week, i.e. an order of magnitude more ongoing manager time than the course. A COO who has read the document review will do this math. The honest framing is available and stronger: *the 1:1 time is the intervention, not an overhead — it displaces firefighting, rework and exit costs* — but the table as written invites the "your alternative is cheaper" misread. Suggested fix: add a row ("Recurring 1:1 time: ~2 h/manager/week at median span — time already being spent, unstructured; the cadence makes it deliberate") and retitle the compared row "Training-specific time."
- **The turnover-savings arithmetic rounds up**: 22% → 15% is 7 points × 78 new hires ≈ **5.5 exits**, ≈ **$51k** at $9,400 — the three files that carry the claim say "roughly 6 exits (~$56k/year)" (performance-gap, proposal, baseline-dashboard). A skeptical COO will recompute. Suggested fix: "≈5–6 exits/year, ≈$47–56k/year" or use 5.5/$51k everywhere. (The $160k current-cost figure is correct: 17 × $9,400 = $159.8k.)

**Is "what we won't build" confident rather than defensive?** Yes — it is one of the strongest pages. Each refusal is anchored to a specific piece of evidence (the 2024 email series' 30% open rate; "managers can already describe good feedback"; the intake's off-limits constraint used against the offsite) rather than to taste, and it closes by pointing at what *will* be built. No hedging detected.

## 5. Measurement plan probe

- **Is the staggered-rollout isolation defensible with 12 clinics?** The plan itself answers correctly: "12 clinics is 12 clusters; the comparison is directional evidence, not a trial," with raw counts demanded over bare percentages (1.4 pts/manager granularity). Wave composition (worst two + best two + two middle) is sensible for a difference-in-differences read, and the wave-2 gap-closing check is the right falsification test. This is honest and about as defensible as a 12-cluster design gets.
- **Confounds**: five named (labor market, pay event, leadership changes, seasonality, Hawthorne), each with a mitigation; the guardrail row (throughput/wait times) is a practitioner-grade touch that protects the intervention politically; the pre-registered stop/adjust rule (cadence ≥70% but pulse < +0.4 → content coaching, referencing the Cedar Point pattern) is the best single line in the document.
- Nit: the pulse target's deadline is "within 2 quarters" in the performance-gap table but the measurement plan only says "Quarterly" (a cadence, not a deadline). Align.

## 6. Consistency spot-check

22% / 31% / 2.4/5 agree in every checked location (intake, survey analysis, performance gap, proposal, measurement plan, dashboard, README); the seeded CSV regenerates byte-identically and the reviewer re-ran the gate successfully. The only numeric wrinkle found is the $56k/6-exits rounding above. One extra internal number check: weighted pulse mean (45×3.4 + 85×1.9)/130 = 2.42 ≈ 2.4 ✓; Cedar Point (12×1.5 + 118×2.5)/130 ≈ 2.4 ✓.

## 7. Honesty sweep

- **Simulated/fictional labels**: present on the home page, all section indexes, and all evidence artifacts (intake, interviews, survey, documents, dashboard, measurement plan, proposal, challenge, scenario footer). **Six content pages carry no on-page label** (mager-pipe-flowchart, action-map, solution-blueprint, what-we-wont-build, 05-build/index, intake-form-template) — they are covered by their section-index banners, but a one-line banner on each (especially what-we-wont-build, a "headline" page) would make the labeling airtight.
- **README evaluation-status line**: says "agent-based design reviews are complete" while `docs/06-measure/usability-test-report.md` and `STATUS.md` list the reviewer walkthrough as **PENDING**. This review completes that item — but the README line should only be committed together with this file, and the report's table row updated, or the two contradict. Flagged for reconciliation, not as fabrication.
- **No fabricated results**: `evaluation/results.md` and STATUS pending rows intact with "PENDING: requires API key"; dry-run outputs are stubs, loudly labeled "DRY RUN – NOT REAL RESULTS", and gitignored (verified via `git check-ignore`). No learning-gain, significance or "validated with users" claims anywhere.
- **AI disclosure**: README section is specific about the build/review split; ATTRIBUTION repeats it; METHODS labels every method and states the same-model limitation (which this review's header repeats).
- **[Email] · [LinkedIn]** placeholders untouched. **PENDING markers** intact. **No VoiceOver testing claimed** — stated plainly in four places.

## 8. Cognitive walkthrough (three personas, live site)

**Persona A — newly promoted manager, no L&D background.**
Finds the case via the home page: the `h1` *is* the request ("Can you build a 2-hour e-learning course on giving feedback?") — instantly legible. Step counts: home → scenario = **1 click** (link above the fold); scenario start → Decision 1 = 1 gateway click ("Head over and talk to Priya"); 11 link activations to the debrief; debrief → job aid = 1 click. Stumbles: (a) "Run the evidence through Gilbert's Behavior Engineering Model and the Mager & Pipe flow" on the home page is unexplained jargon on first encounter (the "killer number" sentence after it rescues comprehension); (b) the BEM page's cause-ID scheme (E/P-1, P-1b, C-0, M-4b) is the highest-jargon page on the site — a non-L&D reader will skim it and miss that this is where the case is won; is-it-training is the page they can actually use, and the home page's "Start anywhere" table routes to it correctly.

**Persona B — HR director.**
The intake tables and reframing callouts read as something they have lived; the Cedar Point wrinkle and the M2 contradiction ("I give feedback constantly" vs his team's 2.1/5) are the moments that make the discovery feel real. This persona *will* push on the cost table (section 4 above) — that is the one place the proposal hands a skeptical executive a weapon. "What we need from leadership" gives HR a concrete, ownable ask (form change, template, challenge co-ownership), which lands well.

**Persona C — busy frontline manager.**
The "Start anywhere" router table solves the 32-page problem. The scenario is billed at 15 minutes and plays in roughly that with reflection; passage headings ("Decision 2 — The pushback") give a sense of position. Stumbles: no overall progress indicator (Decision 2 of 3 is inferable only from numbering), and the D1/D2 options are quoted dialog while D3's are abstract second-person descriptions — a style shift that costs a re-read exactly when the player is deciding.

## 9. Heuristic evaluation (Nielsen's 10) — severity 0–4

| # | Heuristic | Severity | Evidence |
|---|---|---|---|
| 1 | Visibility of system status | **2** | Scenario has no overall progress indicator ("Decision 2 of 3"); endings arrive unannounced. Mitigated by short length and numbered decision headings. Site nav correctly highlights the current section. |
| 2 | Match between system and real world | **1** | Clinical language (handovers, rosters, flu wave, agency across town) is authentic. One false note: the job aid's "raising something personal" example reuses the scenario character's name ("you cut Priya off twice") — in-world the job aid is distributed to all 70 managers, so a specific nurse's name in a template example is odd. |
| 3 | User control and freedom | **1** | No visible in-story undo/restart; recovery is browser-back or the SugarCube sidebar menu (collapsed on narrow screens). Choices advance immediately with no confirmation — acceptable for the genre, but an accidental click costs the run. |
| 4 | Consistency and standards | **1** | Option presentation style shifts between decisions (dialog-with-gloss in D1/D2 vs abstract description in D3), and the strong option's structural signature (last/longest/unglossed) is itself a consistency the player can exploit — see section 2. |
| 5 | Error prevention | 0 | No destructive or irreversible actions; no timed choices (verified). |
| 6 | Recognition rather than recall | 1 | The five-move model must be held from scene text alone during play; the job aid appears only at the debrief. Defensible design (support arrives when the loop closes), noted as a deliberate trade-off. |
| 7 | Flexibility and efficiency of use | 1 | Replay means re-reading every passage; a "skip to the decisions" replay affordance would help repeated runs (and the pending simulation-style reviews). |
| 8 | Aesthetic and minimalist design | 0 | Passages are clean; the debrief is long but well-structured with headed lists (the 320px fix). |
| 9 | Help users recognize, diagnose, recover from errors | 0 | No error states exist; every passage always offers a next link. |
| 10 | Help and documentation | 0 | The debrief teaches with the player's own path; the home page's "Start anywhere" table is genuinely good documentation-by-routing. |

No heuristic reaches severity 3. The site as a whole (Just the Docs) contributes no violations.

## 10. Structured review form (completed)

| # | Item | Rating | Justification |
|---|---|---|---|
| 1 | Intake reframes before solutioning | **pass** | Request captured verbatim; three reframing callouts each produce a finding (unexamined survey theme; the turnover metric; no prior diagnosis); the "agreement to reframe" section is a nice consulting-realism touch. |
| 2 | Every cause has cited evidence | **pass** | All four causes cite named interviews, survey findings and documents that exist and say what is claimed. S-1 is the thinnest (one interview + inference) — noted, not failed, because the recommended training slice is proportionate. |
| 3 | Analysis would survive expert scrutiny | **concern** | Mager & Pipe application is sound (environment-first, "life depended on it", obstacles). The BEM table needs repair before an expert reads it: individual-row columns mislabeled (should be Knowledge/Capacity/Motives), nine cause IDs vs the four-cause story, "four of the six environmental cells" miscount. |
| 4 | Proposal is business-ready | **concern** | Leads with the recommendation, business tone, ~2 pages, risks table is credible. Cost logic has two soft spots: recurring 1:1 manager time omitted from the comparison, and the $56k/6-exit rounding (math says ~5.5/$51k). |
| 5 | Action map ties activities to behavior | **pass** | Four observable behaviors; each has "why aren't they doing it" with evidence; "None — doing it IS the practice" is the correct action-mapping move; explicit exclusions list. |
| 6 | No obviously right scenario option | **concern** | D1 and D2 telegraph the strong option (always last, longest, only unglossed option; D1-A near-strawman; D2-B dialog caricatured). D3 is genuinely balanced. Concrete rewording provided in section 2. |
| 7 | Consequence-based feedback | **pass** | Verified live: consequences vary per choice, no "Correct!", no scores shown, endings flow from the pattern of choices; the debrief's path-naming is post-hoc teaching, not judgment labels. |
| 8 | Measurement plan holds up | **pass** | Leading/behavior/lagging chain each tests a different link; 12-cluster honesty stated; five confounds with mitigations; guardrails; stop/adjust rule. Minor deadline-alignment nit. |
| 9 | Accessibility baseline met | **pass** | Independently verified: axe 0 violations on three pages; keyboard 1-tab-to-choice; focus on new passage heading after every choice (live, all three paths); chart alt text carries takeaways with data tables; Mermaid has text summaries; claims match evidence, including the honest no-VoiceOver statement. |
| 10 | Simulated material clearly labeled | **pass** | Every dataset/interview/document/artifact labeled; six content pages rely on section-index banners (nit); README status-line sequencing needs reconciling with this review (nit); dry-run outputs correctly labeled and uncommitted. |
| 11 | A first-time reader can follow it | **pass** | The narrative home page carries the whole arc; "Start anywhere" routes by reader intent; section indexes orient. The BEM page is the one place a lay reader stalls. |

### Open findings

| Severity | Artifact / page | Issue | Suggested change |
|---|---|---|---|
| **High** | `src/scenario.twee` D1/D2 (live scenario) | Strong option telegraphed: always position 3, always longest, only option without a gloss; D1-A near-strawman; D2-B dialog ("I need you to comply") caricatured. Contradicts the design doc's own "no obviously right option" check. | Reorder (strong first in one decision, middle in another); equalize or strip glosses; trim D1-Strong; de-caricature D2-B — exact wording in section 2 above. |
| Medium | `docs/04-solution/stakeholder-proposal.md` cost table | Recurring 1:1 manager time (~2 h/manager/week at median span, per the repo's own document review) absent from the comparison; invites a misread a skeptical COO will exploit. | Add a recurring-time row and retitle the compared row "Training-specific time"; frame 1:1 time as the intervention displacing rework/exit costs. |
| Medium | performance-gap.md, proposal, baseline-dashboard | Turnover savings overstated: 7 pts × 78 ≈ 5.5 exits ≈ $51k, stated as "roughly 6 exits (~$56k/year)" in three places. | State "≈5–6 exits, ≈$47–56k" (or 5.5/$51k) consistently. |
| Medium | `docs/03-analysis/root-cause-bem.md` | Individual-row columns reuse environment labels; nine cause IDs vs the four-cause narrative; "Four of the six environmental cells" miscount. | Relabel individual columns Knowledge/Capacity/Motives; collapse to four primary cause IDs with sub-evidence; fix the count. |
| Low | README vs usability-test-report / STATUS | Status line says agent design reviews complete; report and STATUS say the reviewer walkthrough is pending. | Commit this review and update the report row + STATUS together so the claims agree. |
| Low | `docs/05-build/scenario-design.md` line 9 | "(opens in a new tab)" is false — the live link has no `target` attribute. | Drop the claim or add `target="_blank"` (with a warning for screen readers). |
| Low | Job aid HTML | Example phrasing reuses scenario character "Priya" in an org-wide template artifact. | Neutral name ("a colleague") to protect the fiction. |
| Low | Six docs pages | No on-page simulated/fictional label (covered only by section indexes): mager-pipe-flowchart, action-map, solution-blueprint, what-we-wont-build, 05-build/index, intake-form-template. | One-line banner per page, matching the house pattern. |
| Low | performance-gap.md vs measurement-plan.md | Pulse target deadline "within 2 quarters" vs quarterly cadence without a deadline. | Align on one statement. |
| Low | Cause S-1 evidence base | The one training-justifying cause rests mainly on interview M1 plus inference. | Add one simulated corroborating data point (e.g., a manager-survey self-efficacy item or a second interview vignette). |

### Overall assessment

The strongest aspects are the traceability chain (every cause carries named, checkable simulated evidence into a specific fix with an owner), the honesty infrastructure (labeling, pending discipline, verified-by-script claims that actually verify — this reviewer reproduced the keyboard, focus, axe and consistency results), and a measurement plan that argues like a practitioner rather than a student. The weakest aspects are the scenario's option telegraphing on decisions 1 and 2 — the project's central artifact claim, currently the most likely thing a portfolio reviewer or the pending simulation run will flag — and two credibility leaks in the proposal's cost story that a skeptical executive (the persona this artifact most needs to convince) would exploit. All findings are addressable with wording-level changes; none require restructuring.

### Reviewer metadata

- Reviewer type: **agent** (separate reviewer agent, fresh context; did not build the repo)
- Model/agent: ZCode agent powered by GLM (account: zai-start-plan/GLM-5.3-Flash); date 2026-10-26; no temperature setting (deterministic tool-assisted review with browser automation)
- Same-model disclosure: the reviewer may share a model family with the authoring agent; this is a limitation of the review, and human/educator review remains outstanding.
- Tools used: repository read; live-site checks with curl; Playwright (Chromium) scripted playthroughs of all three ending paths, keyboard/focus checks; axe-core audits via `tooling/audit-axe.mjs` (output in /tmp/review02-axe); `npm run check:consistency` re-run.
